import { NextResponse } from 'next/server'
import {
  invalidJson,
  jsonError,
  readJson,
  routeError,
  sessionUserId,
  unauthorised,
} from '@/lib/api-route'
import { FriendError, respondToRequest } from '@/lib/friends-db'
import { isRequestAction } from '@/lib/friends-types'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ requesterId: string }> },
) {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  const { requesterId } = await params

  const body = await readJson(request)
  if (body === undefined) return invalidJson()

  const action = (body as { action?: unknown } | null)?.action
  if (!isRequestAction(action)) return jsonError('Invalid action', 400)

  try {
    await respondToRequest(userId, requesterId, action)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return routeError(err, {
      label: '[friends] respond',
      fallback: 'Failed to respond to request',
      expected: [FriendError],
    })
  }
}
