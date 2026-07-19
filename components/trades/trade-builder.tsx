'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowRightLeft, Loader2 } from 'lucide-react'
import posthog from 'posthog-js'
import type { CollectionData } from '@/lib/collection'
import { fetchFriendCollection, type TradeActionResult } from '@/lib/trades'
import { TRADE_MESSAGE_MAX_LENGTH } from '@/lib/trades-types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TradeModalShell } from './trade-modal-shell'
import { SelectableCardGrid, type Selection } from './selectable-card-grid'
import { TradeCardThumb } from './trade-card-thumb'

export interface TradeBuilderInitial {
  fromSelection: Selection
  toSelection: Selection
  message: string
  replacesId: number | null
}

/** The counterparty a trade is being composed with. */
export interface TradePartner {
  id: string
  name: string | null
  image?: string | null
}

function totalCards(selection: Selection): number {
  return Object.values(selection).reduce((n, q) => n + q, 0)
}

export function TradeBuilder({
  friend,
  myCollection,
  initial,
  onClose,
  onSend,
}: {
  friend: TradePartner
  myCollection: CollectionData
  initial?: TradeBuilderInitial
  onClose: () => void
  onSend: (input: {
    toUserId: string
    fromItems: { cardId: string; quantity: number }[]
    toItems: { cardId: string; quantity: number }[]
    message: string | null
    replacesId: number | null
  }) => Promise<TradeActionResult>
}) {
  const [friendCollection, setFriendCollection] =
    useState<CollectionData | null>(null)
  const [loadingFriend, setLoadingFriend] = useState(true)
  const [side, setSide] = useState<'from' | 'to'>('from')
  const [fromSelection, setFromSelection] = useState<Selection>(
    initial?.fromSelection ?? {},
  )
  const [toSelection, setToSelection] = useState<Selection>(
    initial?.toSelection ?? {},
  )
  const [message, setMessage] = useState(initial?.message ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoadingFriend(true)
    fetchFriendCollection(friend.id)
      .then((data) => {
        if (!cancelled) setFriendCollection(data)
      })
      .finally(() => {
        if (!cancelled) setLoadingFriend(false)
      })
    return () => {
      cancelled = true
    }
  }, [friend.id])

  const fromCount = totalCards(fromSelection)
  const toCount = totalCards(toSelection)
  const canSend = fromCount + toCount > 0 && !busy

  const myOwnedIds = useMemo(
    () => new Set(Object.keys(myCollection.cards)),
    [myCollection],
  )
  const friendOwnedIds = useMemo(
    () => new Set(Object.keys(friendCollection?.cards ?? {})),
    [friendCollection],
  )

  const setQuantity = (
    setter: typeof setFromSelection,
    cardId: string,
    quantity: number,
  ) => {
    setter((prev) => {
      const next = { ...prev }
      if (quantity <= 0) delete next[cardId]
      else next[cardId] = quantity
      return next
    })
  }

  const send = async () => {
    setBusy(true)
    setError(null)
    const toItems = Object.entries(toSelection).map(([cardId, quantity]) => ({
      cardId,
      quantity,
    }))
    const fromItems = Object.entries(fromSelection).map(
      ([cardId, quantity]) => ({ cardId, quantity }),
    )
    const result = await onSend({
      toUserId: friend.id,
      fromItems,
      toItems,
      message: message.trim() ? message.trim() : null,
      replacesId: initial?.replacesId ?? null,
    })
    setBusy(false)
    if (result.ok) {
      posthog.capture('trade_offer_sent', {
        from_card_count: fromItems.length,
        to_card_count: toItems.length,
        is_counter_offer: initial?.replacesId != null,
        has_message: message.trim().length > 0,
      })
      onClose()
    } else {
      setError(result.error ?? 'Could not send the offer.')
    }
  }

  const activeCollection = side === 'from' ? myCollection : friendCollection

  return (
    <TradeModalShell
      title={initial?.replacesId ? 'Modify trade' : `Trade with ${friend.name ?? 'player'}`}
      subtitle="Pick what you'll give and what you want in return."
      onClose={onClose}
      footer={
        <div className="space-y-3">
          {error && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4" />
              {error}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Giving {fromCount} · Requesting {toCount}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
                Cancel
              </Button>
              <Button size="sm" onClick={send} disabled={!canSend}>
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRightLeft className="size-4" />
                )}
                {initial?.replacesId ? 'Send counter-offer' : 'Send offer'}
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-background/50 p-1">
          <SideTab
            label="You give"
            count={fromCount}
            active={side === 'from'}
            onClick={() => setSide('from')}
          />
          <SideTab
            label="You want"
            count={toCount}
            active={side === 'to'}
            onClick={() => setSide('to')}
          />
        </div>

        {side === 'from' ? (
          <SelectableCardGrid
            collection={myCollection}
            selection={fromSelection}
            onChange={(id, q) => setQuantity(setFromSelection, id, q)}
            emptyLabel="You don't own any cards yet."
            compareOwnedIds={loadingFriend ? undefined : friendOwnedIds}
            filterLabel="Hide cards they own"
            compareBadge="They have"
            filterEmptyLabel={`${friend.name ?? 'They'} already own every card you have.`}
          />
        ) : loadingFriend ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Loading {friend.name ?? 'their'} collection…
          </p>
        ) : friendCollection ? (
          <SelectableCardGrid
            collection={friendCollection}
            selection={toSelection}
            onChange={(id, q) => setQuantity(setToSelection, id, q)}
            emptyLabel="This player has no cards to request yet."
            compareOwnedIds={myOwnedIds}
            filterLabel="Hide cards you own"
            compareBadge="You have"
            filterEmptyLabel="You already own every card they have."
          />
        ) : (
          <p className="py-8 text-center text-sm text-destructive">
            Could not load their collection.
          </p>
        )}

        <SelectionSummary
          fromCollection={myCollection}
          toCollection={friendCollection}
          fromSelection={fromSelection}
          toSelection={toSelection}
        />

        <div>
          <label
            htmlFor="trade-message"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Message (optional)
          </label>
          <textarea
            id="trade-message"
            value={message}
            maxLength={TRADE_MESSAGE_MAX_LENGTH}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Add a note…"
            className="mt-1 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
    </TradeModalShell>
  )
}

function SideTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
      {count > 0 && (
        <span
          className={cn(
            'rounded-full px-1.5 text-xs font-bold',
            active ? 'bg-primary-foreground/20' : 'bg-muted',
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function SelectionSummary({
  fromCollection,
  toCollection,
  fromSelection,
  toSelection,
}: {
  fromCollection: CollectionData
  toCollection: CollectionData | null
  fromSelection: Selection
  toSelection: Selection
}) {
  const fromCards = useMemo(
    () => resolveSelection(fromCollection, fromSelection),
    [fromCollection, fromSelection],
  )
  const toCards = useMemo(
    () => resolveSelection(toCollection, toSelection),
    [toCollection, toSelection],
  )

  if (fromCards.length === 0 && toCards.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-background/50 p-3">
      <SummaryColumn label="You give" cards={fromCards} />
      <SummaryColumn label="You get" cards={toCards} />
    </div>
  )
}

function resolveSelection(
  collection: CollectionData | null,
  selection: Selection,
) {
  if (!collection) return []
  return Object.entries(selection)
    .map(([cardId, quantity]) => {
      const card = collection.cards[cardId]
      return card ? { card, quantity } : null
    })
    .filter((v): v is { card: CollectionData['cards'][string]; quantity: number } => v !== null)
}

function SummaryColumn({
  label,
  cards,
}: {
  label: string
  cards: { card: CollectionData['cards'][string]; quantity: number }[]
}) {
  return (
    <div>
      <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {cards.length === 0 ? (
        <p className="text-xs text-muted-foreground/70">Nothing yet</p>
      ) : (
        <div className="grid grid-cols-4 gap-1.5">
          {cards.map(({ card, quantity }) => (
            <TradeCardThumb key={card.id} card={card} quantity={quantity} />
          ))}
        </div>
      )}
    </div>
  )
}
