import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { FriendError, assertFriends } from '@/lib/friends-db'
import { getUserCollection } from '@/lib/collection-db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params

  try {
    await assertFriends(session.user.id, id)
    const collection = await getUserCollection(id)
    return NextResponse.json(collection)
  } catch (err) {
    if (err instanceof FriendError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.log(
      '[friends] collection failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: "Failed to load friend's collection" },
      { status: 500 },
    )
  }
}
