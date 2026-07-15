import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { TradeError, getTradeOffer } from '@/lib/trades-db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  const offerId = Number(id)
  if (!Number.isInteger(offerId)) {
    return NextResponse.json({ error: 'Invalid trade id' }, { status: 400 })
  }

  try {
    const offer = await getTradeOffer(session.user.id, offerId)
    return NextResponse.json(offer)
  } catch (err) {
    if (err instanceof TradeError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.log('[trades] detail failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to load trade' }, { status: 500 })
  }
}
