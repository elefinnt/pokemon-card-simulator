import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { FriendError } from '@/lib/friends-db'
import { TradeError, respondToTrade } from '@/lib/trades-db'
import { isTradeResponseAction } from '@/lib/trades-types'
import { getPostHogClient } from '@/lib/posthog-server'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const action = (body as { action?: unknown } | null)?.action
  if (!isTradeResponseAction(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  try {
    await respondToTrade(session.user.id, offerId, action)
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: session.user.id,
      event: 'trade_responded',
      properties: {
        trade_id: offerId,
        action,
      },
    })
    await posthog.flush()
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof TradeError || err instanceof FriendError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.log('[trades] respond failed:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Failed to respond to trade' },
      { status: 500 },
    )
  }
}
