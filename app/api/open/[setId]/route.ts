import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { openPack } from '@/lib/pokemon'
import { ensurePacksLoaded, getPack } from '@/lib/packs'
import { RateLimitError } from '@/lib/pokemontcg/client'
import { recordPackForUser } from '@/lib/collection-db'
import { recordPackOpening } from '@/lib/community/community-db'
import { getPostHogClient } from '@/lib/posthog-server'

export const dynamic = 'force-dynamic'

async function openPackForSet(setId: string, boostHit = false) {
  await ensurePacksLoaded()
  if (!getPack(setId)) {
    return NextResponse.json({ error: 'Unknown pack' }, { status: 404 })
  }

  try {
    const pack = await openPack(setId, { boostHit })
    return NextResponse.json(pack)
  } catch (err) {
    console.log('[open] failed:', err instanceof Error ? err.message : err)

    if (err instanceof RateLimitError) {
      return NextResponse.json(
        {
          error:
            'The card service is busy right now (rate limited). Please try again in a moment.',
        },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to open pack. Please try again.' },
      { status: 502 },
    )
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
  const { setId } = await params
  const boostHit = new URL(request.url).searchParams.get('boost') === '1'
  return openPackForSet(setId, boostHit)
}

/** Signed-in pack open — cards are persisted to the account. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to open packs' }, { status: 401 })
  }

  const { setId } = await params

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

    return NextResponse.json(pack)
  } catch (err) {
    console.log('[open] POST failed:', err instanceof Error ? err.message : err)

    if (err instanceof RateLimitError) {
      return NextResponse.json(
        {
          error:
            'The card service is busy right now (rate limited). Please try again in a moment.',
        },
        { status: 429 },
      )
    }

    if (err instanceof Error && err.message === 'DATABASE_URL is not configured') {
      return NextResponse.json(
        { error: 'Database is not configured' },
        { status: 503 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to open pack. Please try again.' },
      { status: 502 },
    )
  }
}
