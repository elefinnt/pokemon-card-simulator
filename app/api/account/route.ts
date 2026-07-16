import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { deleteUserAccount } from '@/lib/account-db'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    await deleteUserAccount(session.user.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.log(
      '[account] DELETE failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 },
    )
  }
}
