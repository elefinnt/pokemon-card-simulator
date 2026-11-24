import { NextResponse } from 'next/server'
import {
  invalidJson,
  jsonError,
  parseIntegerParam,
  readJson,
  routeError,
  sessionUserId,
  unauthorised,
} from '@/lib/api-route'
import { setReaction } from '@/lib/community/community-db'
import { isReactionKey } from '@/lib/community/types'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ openingId: string }> },
) {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  const openingId = parseIntegerParam((await params).openingId)
  if (openingId === null || openingId <= 0) {
    return jsonError('Invalid opening id', 400)
  }

  const body = await readJson(request)
  if (body === undefined) return invalidJson()

  const reaction = (body as { reaction?: unknown } | null)?.reaction
  if (!isReactionKey(reaction)) return jsonError('Invalid reaction', 400)

  try {
    const ok = await setReaction(userId, openingId, reaction)
    if (!ok) return jsonError('Opening not found', 404)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return routeError(err, {
      label: '[community] reaction',
      fallback: 'Failed to react',
    })
  }
}
