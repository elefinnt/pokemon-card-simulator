import { NextResponse } from 'next/server'
import { upstreamError } from '@/lib/api-route'
import { getCardById } from '@/lib/pokemontcg/cards'

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
    return upstreamError(err, {
      label: '[card] fetch',
      fallback: 'Failed to load card details.',
    })
  }
}
