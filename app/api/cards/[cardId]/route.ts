import { NextResponse } from 'next/server'
import { getCardById } from '@/lib/pokemontcg/cards'
import { RateLimitError } from '@/lib/pokemontcg/client'

export const dynamic = 'force-dynamic'

/** Full card detail for the collection modal. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const { cardId } = await params

  try {
    const card = await getCardById(cardId)
    return NextResponse.json(card)
  } catch (err) {
    console.log('[card] fetch failed:', err instanceof Error ? err.message : err)

    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'Rate limited. Please try again shortly.' },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to load card details.' },
      { status: 502 },
    )
  }
}
