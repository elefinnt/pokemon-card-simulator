import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { setReaction } from '@/lib/community/community-db'
import { isReactionKey } from '@/lib/community/types'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ openingId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { openingId: raw } = await params
  const openingId = Number(raw)
  if (!Number.isInteger(openingId) || openingId <= 0) {
    return NextResponse.json({ error: 'Invalid opening id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const reaction = (body as { reaction?: unknown } | null)?.reaction
  if (!isReactionKey(reaction)) {
    return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 })
  }

  try {
    const ok = await setReaction(session.user.id, openingId, reaction)
    if (!ok) {
      return NextResponse.json({ error: 'Opening not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.log(
      '[community] reaction failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to react' },
      { status: 500 },
    )
  }
}
