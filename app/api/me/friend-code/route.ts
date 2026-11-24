import { NextResponse } from 'next/server'
import { routeError, sessionUserId, unauthorised } from '@/lib/api-route'
import { FriendError, ensureFriendCode } from '@/lib/friends-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  try {
    const code = await ensureFriendCode(userId)
    return NextResponse.json({ code })
  } catch (err) {
    return routeError(err, {
      label: '[friends] friend-code',
      fallback: 'Failed to load friend code',
      expected: [FriendError],
    })
  }
}
