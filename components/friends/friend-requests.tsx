'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FriendAvatar } from './friend-avatar'
import type { ActionResult, FriendRequest } from '@/lib/friends'

function displayName(request: FriendRequest): string {
  return request.name ?? 'Unknown player'
}

export function FriendRequests({
  incoming,
  outgoing,
  onRespond,
  onCancel,
}: {
  incoming: FriendRequest[]
  outgoing: FriendRequest[]
  onRespond: (
    requesterId: string,
    action: 'accept' | 'decline',
  ) => Promise<ActionResult>
  onCancel: (userId: string) => Promise<ActionResult>
}) {
  if (incoming.length === 0 && outgoing.length === 0) return null

  return (
    <div className="space-y-6">
      {incoming.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Requests ({incoming.length})
          </h3>
          <ul className="mt-3 space-y-2">
            {incoming.map((request) => (
              <IncomingRow
                key={request.userId}
                request={request}
                onRespond={onRespond}
              />
            ))}
          </ul>
        </section>
      )}

      {outgoing.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Pending ({outgoing.length})
          </h3>
          <ul className="mt-3 space-y-2">
            {outgoing.map((request) => (
              <OutgoingRow
                key={request.userId}
                request={request}
                onCancel={onCancel}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function IncomingRow({
  request,
  onRespond,
}: {
  request: FriendRequest
  onRespond: (
    requesterId: string,
    action: 'accept' | 'decline',
  ) => Promise<ActionResult>
}) {
  const [busy, setBusy] = useState(false)

  const act = async (action: 'accept' | 'decline') => {
    setBusy(true)
    await onRespond(request.userId, action)
    setBusy(false)
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <FriendAvatar name={request.name} image={request.image} />
      <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
        {displayName(request)}
      </span>
      <Button
        size="sm"
        onClick={() => act('accept')}
        disabled={busy}
        className="font-semibold"
      >
        <Check className="size-3.5" />
        Accept
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={() => act('decline')}
        disabled={busy}
        aria-label="Decline request"
      >
        <X className="size-4" />
      </Button>
    </li>
  )
}

function OutgoingRow({
  request,
  onCancel,
}: {
  request: FriendRequest
  onCancel: (userId: string) => Promise<ActionResult>
}) {
  const [busy, setBusy] = useState(false)

  const cancel = async () => {
    setBusy(true)
    await onCancel(request.userId)
    setBusy(false)
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <FriendAvatar name={request.name} image={request.image} />
      <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
        {displayName(request)}
      </span>
      <span className="text-xs text-muted-foreground">Pending</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={cancel}
        disabled={busy}
        className="text-muted-foreground"
      >
        Cancel
      </Button>
    </li>
  )
}
