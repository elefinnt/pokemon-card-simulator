import { NextResponse } from 'next/server'
import { routeError, sessionUserId, unauthorised } from '@/lib/api-route'
import { ProfileError, getPublicProfile } from '@/lib/profile-db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  const { id } = await params

  try {
    const profile = await getPublicProfile(userId, id)
    return NextResponse.json(profile)
  } catch (err) {
    return routeError(err, {
      label: '[profile] public load',
      fallback: 'Failed to load profile',
      expected: [ProfileError],
    })
  }
}
