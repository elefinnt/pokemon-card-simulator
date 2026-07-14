import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { removeFriend } from '@/lib/friends-db'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params

  try {
    await removeFriend(session.user.id, id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.log(
      '[friends] remove failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to remove friend' },
      { status: 500 },
    )
  }
}
