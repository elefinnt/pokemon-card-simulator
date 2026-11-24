import { NextResponse } from 'next/server'
import {
  invalidJson,
  jsonError,
  parseIntegerParam,
  readJson,
  routeError,
  sessionUserId,
  unauthorised,
} from '@/lib/api-route'
import { FriendError } from '@/lib/friends-db'
import { TradeError, respondToTrade } from '@/lib/trades-db'
import { isTradeResponseAction } from '@/lib/trades-types'
import { getPostHogClient } from '@/lib/posthog-server'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  const offerId = parseIntegerParam((await params).id)
  if (offerId === null) return jsonError('Invalid trade id', 400)

  const body = await readJson(request)
  if (body === undefined) return invalidJson()

  const action = (body as { action?: unknown } | null)?.action
  if (!isTradeResponseAction(action)) return jsonError('Invalid action', 400)

  try {
    await respondToTrade(userId, offerId, action)
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: userId,
      event: 'trade_responded',
      properties: {
        trade_id: offerId,
        action,
      },
    })
    await posthog.flush()
    return NextResponse.json({ ok: true })
  } catch (err) {
    return routeError(err, {
      label: '[trades] respond',
      fallback: 'Failed to respond to trade',
      expected: [TradeError, FriendError],
    })
  }
}
