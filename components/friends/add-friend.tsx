'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isValidFriendCode, normaliseFriendCode } from '@/lib/friends-types'
import type { ActionResult } from '@/lib/friends'

export function AddFriend({
  onSendRequest,
}: {
  onSendRequest: (code: string) => Promise<ActionResult>
}) {
  const [myCode, setMyCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/me/friend-code')
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { code?: string } | null) => {
        if (!cancelled && body?.code) setMyCode(body.code)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const copyCode = async () => {
    if (!myCode) return
    try {
      await navigator.clipboard.writeText(myCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable; the code is still visible to copy manually.
    }
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const normalised = normaliseFriendCode(code)
    if (!isValidFriendCode(normalised)) {
      setError('That does not look like a valid friend code.')
      return
    }

    setSending(true)
    const result = await onSendRequest(normalised)
    setSending(false)

    if (result.ok) {
      setCode('')
      setSuccess('Friend request sent.')
    } else {
      setError(result.error ?? 'Could not send the request.')
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-extrabold text-foreground">
        Add a friend
      </h3>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your friend code
        </p>
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-lg font-bold tracking-[0.2em] text-foreground">
            {myCode ?? '··········'}
          </code>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={copyCode}
            disabled={!myCode}
            aria-label="Copy your friend code"
          >
            {copied ? (
              <Check className="size-4 text-primary" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Share this code so other players can add you.
        </p>
      </div>

      <form onSubmit={submit} className="mt-5">
        <label
          htmlFor="friend-code"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Enter a friend&apos;s code
        </label>
        <div className="mt-2 flex items-center gap-2">
          <Input
            id="friend-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABCD234XYZ"
            maxLength={12}
            autoComplete="off"
            spellCheck={false}
            className="h-10 font-mono tracking-[0.2em] uppercase"
          />
          <Button type="submit" disabled={sending} className="h-10 shrink-0 font-semibold">
            <UserPlus className="size-4" />
            {sending ? 'Sending…' : 'Add'}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        {success && <p className="mt-2 text-sm text-primary">{success}</p>}
      </form>
    </div>
  )
}
