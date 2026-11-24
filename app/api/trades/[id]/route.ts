import { NextResponse } from 'next/server'
import {
  jsonError,
  parseIntegerParam,
  routeError,
  sessionUserId,
  unauthorised,
} from '@/lib/api-route'
import { TradeError, getTradeOffer } from '@/lib/trades-db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  const offerId = parseIntegerParam((await params).id)
  if (offerId === null) return jsonError('Invalid trade id', 400)

  try {
    const offer = await getTradeOffer(userId, offerId)
    return NextResponse.json(offer)
  } catch (err) {
    return routeError(err, {
      label: '[trades] detail',
      fallback: 'Failed to load trade',
      expected: [TradeError],
    })
  }
}
