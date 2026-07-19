import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { FriendError, sendFriendRequestByCode } from '@/lib/friends-db'
import { isValidFriendCode } from '@/lib/friends-types'
import { getPostHogClient } from '@/lib/posthog-server'

export const dynamic = 'force-dynamic'

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

  const code = (body as { code?: unknown } | null)?.code
  if (typeof code !== 'string' || !isValidFriendCode(code)) {
    return NextResponse.json({ error: 'Invalid friend code' }, { status: 400 })
  }

  try {
    await sendFriendRequestByCode(session.user.id, code)
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: session.user.id,
      event: 'friend_request_sent',
      properties: {},
    })
    await posthog.flush()
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof FriendError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.log(
      '[friends] request failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 },
    )
  }
}
