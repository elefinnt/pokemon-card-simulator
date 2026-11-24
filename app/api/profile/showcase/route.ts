import { NextResponse } from 'next/server'
import {
  jsonError,
  routeError,
  sessionUserId,
  unauthorised,
} from '@/lib/api-route'
import { ProfileError, updateShowcase } from '@/lib/profile-db'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  const body = (await request.json().catch(() => null)) as {
    cardIds?: unknown
  } | null

  const cardIds = Array.isArray(body?.cardIds)
    ? body.cardIds.filter((v): v is string => typeof v === 'string')
    : null

  if (!cardIds) return jsonError('Expected a cardIds array', 400)

  try {
    const profile = await updateShowcase(userId, cardIds)
    return NextResponse.json(profile)
  } catch (err) {
    return routeError(err, {
      label: '[profile] showcase update',
      fallback: 'Failed to update your showcase',
      expected: [ProfileError],
    })
  }
}
