import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ProfileError, getPublicProfile } from '@/lib/profile-db'

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
    const profile = await getPublicProfile(session.user.id, id)
    return NextResponse.json(profile)
  } catch (err) {
    if (err instanceof ProfileError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.log(
      '[profile] public load failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 },
    )
  }
}
