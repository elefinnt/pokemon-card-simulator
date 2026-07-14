import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { FriendError, respondToRequest } from '@/lib/friends-db'
import { isRequestAction } from '@/lib/friends-types'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ requesterId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { requesterId } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const action = (body as { action?: unknown } | null)?.action
  if (!isRequestAction(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  try {
    await respondToRequest(session.user.id, requesterId, action)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof FriendError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.log(
      '[friends] respond failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to respond to request' },
      { status: 500 },
    )
  }
}
