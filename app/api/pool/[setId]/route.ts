import { NextResponse } from 'next/server'
import { isCompanionSetId } from '@/lib/pack-overrides'
import { ensurePacksLoaded, getPack } from '@/lib/packs'
import { getCardsForSet } from '@/lib/pokemontcg/cards'
import { RateLimitError } from '@/lib/pokemontcg/client'

export const dynamic = 'force-dynamic'

/** Pre-fetch / warm the card pool for a set. Called when a pack is selected. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  const { setId } = await params

  await ensurePacksLoaded()
  const pack = getPack(setId)
  if (!pack && !isCompanionSetId(setId)) {
    return NextResponse.json({ error: 'Unknown pack' }, { status: 404 })
  }

  try {
    const cards = await getCardsForSet(setId)
    return NextResponse.json({
      setId,
      ready: true,
      count: cards.length,
      total: pack?.total ?? cards.length,
    })
  } catch (err) {
    console.log('[pool] prefetch failed:', err instanceof Error ? err.message : err)

    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'Rate limited. Please try again shortly.' },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to load card pool.' },
      { status: 502 },
    )
  }
}
