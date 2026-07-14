import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { FriendError, ensureFriendCode } from '@/lib/friends-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const code = await ensureFriendCode(session.user.id)
    return NextResponse.json({ code })
  } catch (err) {
    if (err instanceof FriendError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.log(
      '[friends] friend-code failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to load friend code' },
      { status: 500 },
    )
  }
}
