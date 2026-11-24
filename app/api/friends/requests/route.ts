import { NextResponse } from 'next/server'
import {
  invalidJson,
  jsonError,
  readJson,
  routeError,
  sessionUserId,
  unauthorised,
} from '@/lib/api-route'
import { FriendError, sendFriendRequestByCode } from '@/lib/friends-db'
import { isValidFriendCode } from '@/lib/friends-types'
import { getPostHogClient } from '@/lib/posthog-server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  const body = await readJson(request)
  if (body === undefined) return invalidJson()

  const code = (body as { code?: unknown } | null)?.code
  if (typeof code !== 'string' || !isValidFriendCode(code)) {
    return jsonError('Invalid friend code', 400)
  }

  try {
    await sendFriendRequestByCode(userId, code)
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: userId,
      event: 'friend_request_sent',
      properties: {},
    })
    await posthog.flush()
    return NextResponse.json({ ok: true })
  } catch (err) {
    return routeError(err, {
      label: '[friends] request',
      fallback: 'Failed to send friend request',
      expected: [FriendError],
    })
  }
}
