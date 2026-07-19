import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { FriendError } from '@/lib/friends-db'
import { TradeError, createTradeOffer, getTradeOverview } from '@/lib/trades-db'
import { sanitiseItemInputs, sanitiseMessage } from '@/lib/trades-types'
import { getPostHogClient } from '@/lib/posthog-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const overview = await getTradeOverview(session.user.id)
    return NextResponse.json(overview)
  } catch (err) {
    console.log('[trades] GET failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to load trades' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = body as {
    toUserId?: unknown
    fromItems?: unknown
    toItems?: unknown
    message?: unknown
    replacesId?: unknown
  } | null

  const toUserId = payload?.toUserId
  if (typeof toUserId !== 'string' || toUserId.length === 0) {
    return NextResponse.json({ error: 'Missing recipient' }, { status: 400 })
  }

  const fromItems = sanitiseItemInputs(payload?.fromItems ?? [])
  const toItems = sanitiseItemInputs(payload?.toItems ?? [])
  if (!fromItems || !toItems) {
    return NextResponse.json({ error: 'Invalid card selection' }, { status: 400 })
  }
  if (fromItems.length === 0 && toItems.length === 0) {
    return NextResponse.json(
      { error: 'An offer needs at least one card' },
      { status: 400 },
    )
  }

  const replacesRaw = payload?.replacesId
  const replacesId =
    typeof replacesRaw === 'number' && Number.isInteger(replacesRaw)
      ? replacesRaw
      : null

  try {
    const id = await createTradeOffer(session.user.id, {
      toUserId,
      fromItems,
      toItems,
      message: sanitiseMessage(payload?.message),
      replacesId,
    })
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: session.user.id,
      event: 'trade_offer_created',
      properties: {
        trade_id: id,
        from_card_count: fromItems.length,
        to_card_count: toItems.length,
        is_counter_offer: replacesId != null,
        has_message: typeof payload?.message === 'string' && (payload.message as string).trim().length > 0,
      },
    })
    await posthog.flush()
    return NextResponse.json({ ok: true, id })
  } catch (err) {
    if (err instanceof TradeError || err instanceof FriendError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.log(
      '[trades] create failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to send trade offer' },
      { status: 500 },
    )
  }
}
