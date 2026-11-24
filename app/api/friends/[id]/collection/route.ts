import { NextResponse } from 'next/server'
import { routeError, sessionUserId, unauthorised } from '@/lib/api-route'
import { FriendError, assertFriends } from '@/lib/friends-db'
import { getUserCollection } from '@/lib/collection-db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  const { id } = await params

  try {
    await assertFriends(userId, id)
    const collection = await getUserCollection(id)
    return NextResponse.json(collection)
  } catch (err) {
    return routeError(err, {
      label: '[friends] collection',
      fallback: "Failed to load friend's collection",
      expected: [FriendError],
    })
  }
}
