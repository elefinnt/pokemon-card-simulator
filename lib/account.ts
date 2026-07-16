'use client'

export interface AccountActionResult {
  ok: boolean
  error?: string
}

/**
 * Permanently delete the signed-in user's account and all stored data.
 *
 * On success the caller should sign the user out (a full navigation via
 * `signOut`) which also clears the in-memory profile/collection/friends/trade
 * caches held by their respective hooks.
 */
export async function deleteAccount(): Promise<AccountActionResult> {
  const res = await fetch('/api/account', { method: 'DELETE' })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string
    } | null
    return { ok: false, error: body?.error ?? 'Failed to delete account' }
  }
  return { ok: true }
}
