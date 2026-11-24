import { createHmac } from 'node:crypto'
import { NextResponse } from 'next/server'
import type { PoolConnection, RowDataPacket } from 'mysql2/promise'
import { pool } from '@/db'

export interface PackLimits { minute: number; hour: number }

function positiveLimit(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function limitsFor(kind: 'user' | 'guest'): PackLimits {
  return kind === 'user'
    ? {
        minute: positiveLimit(process.env.PACK_OPEN_PER_MINUTE, 30),
        hour: positiveLimit(process.env.PACK_OPEN_PER_HOUR, 300),
      }
    : {
        minute: positiveLimit(process.env.PACK_GUEST_PER_MINUTE, 12),
        hour: positiveLimit(process.env.PACK_GUEST_PER_HOUR, 60),
      }
}

export function packOpeningPauseResponse(): NextResponse | null {
  return process.env.PACK_OPENINGS_PAUSED === 'true'
    ? NextResponse.json({ error: 'Pack opening is taking a short break. Your collection is safe; please try again shortly.' }, {
        status: 503, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' },
      })
    : null
}

// The upsert takes a row lock; the caller holds it until after reading the
// counters. Concurrent requests cannot all observe the same available token.
export const PACK_LIMIT_UPSERT = `INSERT INTO pack_open_limits
  (subject, minute_bucket, minute_count, hour_bucket, hour_count)
  VALUES (?, ?, 1, ?, 1)
  ON DUPLICATE KEY UPDATE
    minute_count = IF(minute_bucket = VALUES(minute_bucket), LEAST(minute_count + 1, 2147483647), 1),
    hour_count = IF(hour_bucket = VALUES(hour_bucket), LEAST(hour_count + 1, 2147483647), 1),
    minute_bucket = VALUES(minute_bucket), hour_bucket = VALUES(hour_bucket),
    updated_at = CURRENT_TIMESTAMP`

export async function takePackOpenToken(
  connection: Pick<PoolConnection, 'execute'>,
  subject: string,
  limits: PackLimits,
  now = Date.now(),
): Promise<number> {
  const minute = Math.floor(now / 60_000)
  const hour = Math.floor(now / 3_600_000)
  await connection.execute(PACK_LIMIT_UPSERT, [subject, minute, hour])
  const [rows] = await connection.execute<RowDataPacket[]>(
    'SELECT minute_count, hour_count FROM pack_open_limits WHERE subject = ?', [subject],
  )
  if (!rows[0]) throw new Error('Pack limit counter was not saved')
  let retryAt = 0
  if (rows[0].minute_count > limits.minute) retryAt = (minute + 1) * 60_000
  if (rows[0].hour_count > limits.hour) retryAt = Math.max(retryAt, (hour + 1) * 3_600_000)
  return retryAt ? Math.max(1, Math.ceil((retryAt - now) / 1000)) : 0
}

export async function enforcePackOpenLimit(request: Request, userId?: string): Promise<NextResponse | null> {
  const kind = userId ? 'user' : 'guest'
  // Vercel overwrites this header at its edge. Do not trust arbitrary proxy
  // headers when running outside Vercel; local guests share a development key.
  const ip = process.env.VERCEL === '1' ? request.headers.get('x-vercel-forwarded-for') : 'local'
  if (!pool && process.env.NODE_ENV !== 'production') return null
  if ((!userId && !ip) || !pool) {
    return NextResponse.json({ error: 'Pack opening is temporarily unavailable. Please try again shortly.' }, { status: 503, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } })
  }
  const subject = createHmac('sha256', process.env.AUTH_SECRET ?? 'local-development')
    .update(userId ? `user:${userId}` : `guest:${ip}`).digest('hex')
  let connection: PoolConnection | undefined
  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()
    const retryAfter = await takePackOpenToken(connection, subject, limitsFor(kind))
    await connection.commit()
    if (!retryAfter) return null
    const wait = retryAfter < 60 ? `${retryAfter} seconds` : `${Math.ceil(retryAfter / 60)} minutes`
    return NextResponse.json({ error: `You've been opening packs quickly. Take a breather and try again in ${wait}.`, retryAfter }, {
      status: 429, headers: { 'Retry-After': String(retryAfter), 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    if (connection) await connection.rollback().catch(() => {})
    console.error('[pack-limit] unavailable:', err instanceof Error ? err.message : 'Unknown error')
    // A broken limiter must not silently enable unlimited costly requests.
    return NextResponse.json({ error: 'Pack opening is temporarily unavailable. Please try again shortly.' }, { status: 503, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } })
  } finally {
    connection?.release()
  }
}
