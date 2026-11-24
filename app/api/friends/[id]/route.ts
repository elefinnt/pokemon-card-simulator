import { NextResponse } from 'next/server'
import { routeError, sessionUserId, unauthorised } from '@/lib/api-route'
import { removeFriend } from '@/lib/friends-db'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  const { id } = await params

  try {
    await removeFriend(userId, id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return routeError(err, {
      label: '[friends] remove',
      fallback: 'Failed to remove friend',
    })
  }
}
