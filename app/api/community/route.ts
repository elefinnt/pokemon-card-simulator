import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getCommunityFeed } from '@/lib/community/community-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  // The feed is public; a signed-in viewer also gets their own reactions.
  const session = await auth()
  const viewerId = session?.user?.id ?? null

  try {
    const events = await getCommunityFeed(viewerId)
    return NextResponse.json({ events })
  } catch (err) {
    console.log(
      '[community] GET failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to load community feed' },
      { status: 500 },
    )
  }
}
