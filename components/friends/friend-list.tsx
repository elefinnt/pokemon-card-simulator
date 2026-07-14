'use client'

import { useState } from 'react'
import { UserMinus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FriendAvatar } from './friend-avatar'
import type { ActionResult, Friend } from '@/lib/friends'

export function FriendList({
  friends,
  onRemove,
}: {
  friends: Friend[]
  onRemove: (id: string) => Promise<ActionResult>
}) {
  if (friends.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <Users className="size-6 text-muted-foreground" />
        </div>
        <p className="mt-4 font-display text-base font-extrabold text-foreground">
          No friends yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your friend code to start building your crew.
        </p>
      </div>
    )
  }

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Friends ({friends.length})
      </h3>
      <ul className="mt-3 space-y-2">
        {friends.map((friend) => (
          <FriendRow key={friend.id} friend={friend} onRemove={onRemove} />
        ))}
      </ul>
    </section>
  )
}

function FriendRow({
  friend,
  onRemove,
}: {
  friend: Friend
  onRemove: (id: string) => Promise<ActionResult>
}) {
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const remove = async () => {
    setBusy(true)
    await onRemove(friend.id)
    setBusy(false)
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <FriendAvatar name={friend.name} image={friend.image} />
      <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
        {friend.name ?? 'Unknown player'}
      </span>
      {confirming ? (
        <>
          <Button
            size="sm"
            variant="destructive"
            onClick={remove}
            disabled={busy}
            className="font-semibold"
          >
            Remove
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirming(false)}
            disabled={busy}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
        </>
      ) : (
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => setConfirming(true)}
          aria-label={`Remove ${friend.name ?? 'friend'}`}
          className="text-muted-foreground"
        >
          <UserMinus className="size-4" />
        </Button>
      )}
    </li>
  )
}
