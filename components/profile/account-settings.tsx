'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { deleteAccount } from '@/lib/account'
import { clearLocalCollection } from '@/lib/collection-local'
import { Button } from '@/components/ui/button'

/**
 * Danger zone: permanently delete the account and every piece of stored data.
 * Deleting the `user` row cascades across all app tables, so this single
 * action erases the collection, profile, friends, trades and community posts.
 */
export function AccountSettings() {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = async () => {
    setBusy(true)
    setError(null)
    const result = await deleteAccount()
    if (!result.ok) {
      setBusy(false)
      setError(result.error ?? 'Could not delete your account.')
      return
    }
    // Drop any guest data cached in the browser before the full sign-out
    // navigation clears the in-memory hook caches.
    clearLocalCollection()
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <h3 className="font-display text-lg font-black text-foreground">
              Delete your account
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently removes your profile, entire collection, pack history,
              friends, trades and community posts. This cannot be undone.
            </p>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-5">
          {confirming ? (
            <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-foreground">
                This will erase everything. Are you sure?
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy}
                  onClick={() => void remove()}
                >
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  Yes, delete my account
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="size-4" />
              Delete account
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
