import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ProfileError, updateShowcase } from '@/lib/profile-db'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as {
    cardIds?: unknown
  } | null

  const cardIds = Array.isArray(body?.cardIds)
    ? body.cardIds.filter((v): v is string => typeof v === 'string')
    : null

  if (!cardIds) {
    return NextResponse.json(
      { error: 'Expected a cardIds array' },
      { status: 400 },
    )
  }

  try {
    const profile = await updateShowcase(session.user.id, cardIds)
    return NextResponse.json(profile)
  } catch (err) {
    if (err instanceof ProfileError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.log(
      '[profile] showcase update failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to update your showcase' },
      { status: 500 },
    )
  }
}
