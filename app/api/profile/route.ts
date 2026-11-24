import { NextResponse } from 'next/server'
import {
  jsonError,
  routeError,
  sessionUserId,
  unauthorised,
} from '@/lib/api-route'
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
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  try {
    const profile = await getMyProfile(userId)
    return NextResponse.json(profile)
  } catch (err) {
    return routeError(err, {
      label: '[profile] load',
      fallback: 'Failed to load your profile',
      expected: [ProfileError],
    })
  }
}

export async function PUT(request: Request) {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  const body = (await request.json().catch(() => null)) as {
    displayName?: unknown
    bio?: unknown
    accent?: unknown
  } | null

  if (!body) return jsonError('Invalid request body', 400)

  try {
    const profile = await updateProfileDetails(userId, {
      displayName: sanitiseText(body.displayName, DISPLAY_NAME_MAX_LENGTH),
      bio: sanitiseText(body.bio, BIO_MAX_LENGTH),
      accent: normaliseAccent(
        typeof body.accent === 'string' ? body.accent : null,
      ),
    })
    return NextResponse.json(profile)
  } catch (err) {
    return routeError(err, {
      label: '[profile] update',
      fallback: 'Failed to update your profile',
      expected: [ProfileError],
    })
  }
}
