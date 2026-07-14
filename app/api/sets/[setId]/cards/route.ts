import { NextResponse } from 'next/server'
import { ensurePacksLoaded, getPack } from '@/lib/packs'
import { getSetCatalogue } from '@/lib/pokemon'
import { RateLimitError } from '@/lib/pokemontcg/client'

export const dynamic = 'force-dynamic'

/** Card catalogue for a set — powers the collection binder grid. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  const { setId } = await params

  await ensurePacksLoaded()
  if (!getPack(setId)) {
    return NextResponse.json({ error: 'Unknown pack' }, { status: 404 })
  }

  try {
    const cards = await getSetCatalogue(setId)
    return NextResponse.json({ setId, cards })
  } catch (err) {
    console.log('[sets/cards] fetch failed:', err instanceof Error ? err.message : err)

    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'Rate limited. Please try again shortly.' },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to load set cards.' },
      { status: 502 },
    )
  }
}
