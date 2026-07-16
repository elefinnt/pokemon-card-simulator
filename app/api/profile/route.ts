import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  ProfileError,
  getMyProfile,
  updateProfileDetails,
} from '@/lib/profile-db'
import {
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  normaliseAccent,
  sanitiseText,
} from '@/lib/profile-types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const profile = await getMyProfile(session.user.id)
    return NextResponse.json(profile)
  } catch (err) {
    return handleError(err, 'load')
  }
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as {
    displayName?: unknown
    bio?: unknown
    accent?: unknown
  } | null

  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const profile = await updateProfileDetails(session.user.id, {
      displayName: sanitiseText(body.displayName, DISPLAY_NAME_MAX_LENGTH),
      bio: sanitiseText(body.bio, BIO_MAX_LENGTH),
      accent: normaliseAccent(
        typeof body.accent === 'string' ? body.accent : null,
      ),
    })
    return NextResponse.json(profile)
  } catch (err) {
    return handleError(err, 'update')
  }
}

function handleError(err: unknown, action: string) {
  if (err instanceof ProfileError) {
    return NextResponse.json({ error: err.message }, { status: err.status })
  }
  console.log(
    `[profile] ${action} failed:`,
    err instanceof Error ? err.message : err,
  )
  return NextResponse.json(
    { error: 'Failed to load your profile' },
    { status: 500 },
  )
}
