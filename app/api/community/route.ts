import { NextResponse } from 'next/server'
import { routeError, sessionUserId } from '@/lib/api-route'
import { getCommunityFeed } from '@/lib/community/community-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  // The feed is public; a signed-in viewer also gets their own reactions.
  const viewerId = await sessionUserId()

  try {
    const events = await getCommunityFeed(viewerId)
    return NextResponse.json({ events })
  } catch (err) {
    return routeError(err, {
      label: '[community] GET',
      fallback: 'Failed to load community feed',
    })
  }
}
