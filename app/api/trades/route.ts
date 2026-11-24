import { NextResponse } from 'next/server'
import {
  invalidJson,
  jsonError,
  readJson,
  routeError,
  sessionUserId,
  unauthorised,
} from '@/lib/api-route'
import { FriendError } from '@/lib/friends-db'
import { TradeError, createTradeOffer, getTradeOverview } from '@/lib/trades-db'
import { sanitiseItemInputs, sanitiseMessage } from '@/lib/trades-types'
import { getPostHogClient } from '@/lib/posthog-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  try {
    const overview = await getTradeOverview(userId)
    return NextResponse.json(overview)
  } catch (err) {
    return routeError(err, {
      label: '[trades] GET',
      fallback: 'Failed to load trades',
    })
  }
}

export async function POST(request: Request) {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  const body = await readJson(request)
  if (body === undefined) return invalidJson()

  const payload = body as {
    toUserId?: unknown
    fromItems?: unknown
    toItems?: unknown
    message?: unknown
    replacesId?: unknown
  } | null

  const toUserId = payload?.toUserId
  if (typeof toUserId !== 'string' || toUserId.length === 0) {
    return jsonError('Missing recipient', 400)
  }

  const fromItems = sanitiseItemInputs(payload?.fromItems ?? [])
  const toItems = sanitiseItemInputs(payload?.toItems ?? [])
  if (!fromItems || !toItems) return jsonError('Invalid card selection', 400)
  if (fromItems.length === 0 && toItems.length === 0) {
    return jsonError('An offer needs at least one card', 400)
  }

  const replacesRaw = payload?.replacesId
  const replacesId =
    typeof replacesRaw === 'number' && Number.isInteger(replacesRaw)
      ? replacesRaw
      : null

  try {
    const id = await createTradeOffer(userId, {
      toUserId,
      fromItems,
      toItems,
      message: sanitiseMessage(payload?.message),
      replacesId,
    })
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: userId,
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
    return routeError(err, {
      label: '[trades] create',
      fallback: 'Failed to send trade offer',
      expected: [TradeError, FriendError],
    })
  }
}
