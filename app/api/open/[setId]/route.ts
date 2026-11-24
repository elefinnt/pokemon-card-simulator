import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { openPack } from '@/lib/pokemon'
import { ensurePacksLoaded, getPack } from '@/lib/packs'
import { jsonError, upstreamError } from '@/lib/api-route'
import { recordPackForUser } from '@/lib/collection-db'
import { recordPackOpening } from '@/lib/community/community-db'
import { getPostHogClient } from '@/lib/posthog-server'
import { PACK_OVERRIDES } from '@/lib/pack-overrides'
import { enforcePackOpenLimit, packOpeningPauseResponse } from '@/lib/pack-open-limits'

export const dynamic = 'force-dynamic'

const OPEN_ERRORS = {
  rateLimited:
    'The card service is busy right now (rate limited). Please try again in a moment.',
  fallback: 'Failed to open pack. Please try again.',
}

async function openPackForSet(setId: string, boostHit = false) {
  await ensurePacksLoaded()
  if (!getPack(setId)) return jsonError('Unknown pack', 404)

  try {
    const pack = await openPack(setId, { boostHit })
    return NextResponse.json(pack, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (err) {
    return upstreamError(err, { label: '[open]', ...OPEN_ERRORS })
  }
}

/**
 * Guest pack open — cards are saved client-side only. Guests get a small run of
 * free packs; the last one may request boosted odds (`?boost=1`) so there's a
 * juicy pull waiting to be saved once they sign in.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  const paused = packOpeningPauseResponse()
  if (paused) return paused
  const { setId } = await params
  if (!Object.hasOwn(PACK_OVERRIDES, setId)) return NextResponse.json({ error: 'Unknown pack' }, { status: 404 })
  const limited = await enforcePackOpenLimit(request)
  if (limited) return limited
  const boostHit = new URL(request.url).searchParams.get('boost') === '1'
  return openPackForSet(setId, boostHit)
}

/** Signed-in pack open — cards are persisted to the account. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  const paused = packOpeningPauseResponse()
  if (paused) return paused
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to open packs' }, { status: 401 })
  }

  const { setId } = await params
  if (!Object.hasOwn(PACK_OVERRIDES, setId)) return NextResponse.json({ error: 'Unknown pack' }, { status: 404 })
  const limited = await enforcePackOpenLimit(request, session.user.id)
  if (limited) return limited

  await ensurePacksLoaded()
  const def = getPack(setId)
  if (!def) {
    return NextResponse.json({ error: 'Unknown pack' }, { status: 404 })
  }

  try {
    const pack = await openPack(setId)
    await recordPackForUser(session.user.id, pack)

    // Publish to the community feed — never let this break the pack open.
    try {
      await recordPackOpening(session.user.id, {
        setId,
        packName: def.name,
        series: def.series,
        opened: pack,
      })
    } catch (feedErr) {
      console.log(
        '[open] community record failed:',
        feedErr instanceof Error ? feedErr.message : feedErr,
      )
    }

    // Analytics failures must not turn an already-saved opening into an error
    // that encourages a retry and duplicate work.
    try {
      const posthog = getPostHogClient()
      posthog.capture({
        distinctId: session.user.id,
        event: 'pack_opened',
        properties: {
          set_id: setId,
          pack_name: def.name,
          series: def.series,
          pack_type: pack.packType,
          best_tier: pack.bestTier,
          card_count: pack.cards.length,
        },
      })
      await posthog.flush()
    } catch (analyticsError) {
      console.warn('[open] analytics failed:', analyticsError instanceof Error ? analyticsError.message : 'Unknown error')
    }

    return NextResponse.json(pack, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (err) {
    if (err instanceof Error && err.message === 'DATABASE_URL is not configured') {
      console.log('[open] POST failed:', err.message)
      return jsonError('Database is not configured', 503)
    }
    return upstreamError(err, { label: '[open] POST', ...OPEN_ERRORS })
  }
}
