'use client'

import { useState } from 'react'
import { ArrowRightLeft, Clock, UserMinus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ActionResult, Friend } from '@/lib/friends'
import type { TradeOffer } from '@/lib/trades'
import { FriendAvatar } from './friend-avatar'

export function FriendList({
  friends,
  onRemove,
  incomingByFriend,
  outgoingByFriend,
  onTrade,
  onOpenOffers,
}: {
  friends: Friend[]
  onRemove: (id: string) => Promise<ActionResult>
  incomingByFriend: Record<string, TradeOffer[]>
  outgoingByFriend: Record<string, TradeOffer[]>
  onTrade: (friend: Friend) => void
  onOpenOffers: (offers: TradeOffer[]) => void
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
          <FriendRow
            key={friend.id}
            friend={friend}
            onRemove={onRemove}
            incoming={incomingByFriend[friend.id] ?? []}
            outgoing={outgoingByFriend[friend.id] ?? []}
            onTrade={onTrade}
            onOpenOffers={onOpenOffers}
          />
        ))}
      </ul>
    </section>
  )
}

function FriendRow({
  friend,
  onRemove,
  incoming,
  outgoing,
  onTrade,
  onOpenOffers,
}: {
  friend: Friend
  onRemove: (id: string) => Promise<ActionResult>
  incoming: TradeOffer[]
  outgoing: TradeOffer[]
  onTrade: (friend: Friend) => void
  onOpenOffers: (offers: TradeOffer[]) => void
}) {
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const hasIncoming = incoming.length > 0
  const hasOutgoing = outgoing.length > 0

  const remove = async () => {
    setBusy(true)
    await onRemove(friend.id)
    setBusy(false)
  }

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
        hasIncoming
          ? 'border-primary/60 bg-primary/5'
          : 'border-border bg-card',
      )}
    >
      <FriendAvatar name={friend.name} image={friend.image} />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="min-w-0 truncate font-semibold text-foreground">
          {friend.name ?? 'Unknown player'}
        </span>
        {hasIncoming && (
          <button
            type="button"
            onClick={() => onOpenOffers(incoming)}
            title={`${incoming.length} pending trade offer${incoming.length > 1 ? 's' : ''}`}
            aria-label={`Review ${incoming.length} pending trade offer${incoming.length > 1 ? 's' : ''}`}
            className="inline-flex shrink-0 animate-pulse items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground"
          >
            <ArrowRightLeft className="size-3" />
            {incoming.length}
          </button>
        )}
      </div>

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
        <>
          {hasOutgoing && !hasIncoming && (
            <button
              type="button"
              onClick={() => onOpenOffers(outgoing)}
              title="You have a pending offer with this player"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <Clock className="size-3" />
              Sent
            </button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTrade(friend)}
            className="font-semibold"
          >
            <ArrowRightLeft className="size-4" />
            Trade
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setConfirming(true)}
            aria-label={`Remove ${friend.name ?? 'friend'}`}
            className="text-muted-foreground"
          >
            <UserMinus className="size-4" />
          </Button>
        </>
      )}
    </li>
  )
}
