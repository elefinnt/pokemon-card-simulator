import { NextResponse } from 'next/server'
import { routeError, sessionUserId, unauthorised } from '@/lib/api-route'
import { getFriendsOverview } from '@/lib/friends-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  try {
    const overview = await getFriendsOverview(userId)
    return NextResponse.json(overview)
  } catch (err) {
    return routeError(err, {
      label: '[friends] GET',
      fallback: 'Failed to load friends',
    })
  }
}
