import { NextResponse } from 'next/server'
import { jsonError, upstreamError } from '@/lib/api-route'
import { isCompanionSetId } from '@/lib/pack-overrides'
import { ensurePacksLoaded, getPack } from '@/lib/packs'
import { getCardsForSet } from '@/lib/pokemontcg/cards'

export const dynamic = 'force-dynamic'

/** Pre-fetch / warm the card pool for a set. Called when a pack is selected. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  const { setId } = await params

  await ensurePacksLoaded()
  const pack = getPack(setId)
  if (!pack && !isCompanionSetId(setId)) return jsonError('Unknown pack', 404)

  try {
    const cards = await getCardsForSet(setId)
    return NextResponse.json({
      setId,
      ready: true,
      count: cards.length,
      total: pack?.total ?? cards.length,
    }, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
    })
  } catch (err) {
    return upstreamError(err, {
      label: '[pool] prefetch',
      fallback: 'Failed to load card pool.',
    })
  }
}
