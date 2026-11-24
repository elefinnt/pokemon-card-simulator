import { NextResponse } from 'next/server'
import { deleteUserAccount } from '@/lib/account-db'
import { routeError, sessionUserId, unauthorised } from '@/lib/api-route'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  const userId = await sessionUserId()
  if (!userId) return unauthorised()

  try {
    await deleteUserAccount(userId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return routeError(err, {
      label: '[account] DELETE',
      fallback: 'Failed to delete account',
    })
  }
}
