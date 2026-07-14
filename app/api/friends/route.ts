import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getFriendsOverview } from '@/lib/friends-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const overview = await getFriendsOverview(session.user.id)
    return NextResponse.json(overview)
  } catch (err) {
    console.log('[friends] GET failed:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Failed to load friends' },
      { status: 500 },
    )
  }
}
