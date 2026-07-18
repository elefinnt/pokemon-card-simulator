'use client'

import { useMemo, useState } from 'react'
import { Minus, Plus, Search } from 'lucide-react'
import type { CollectionData, CollectedCard } from '@/lib/collection'
import { cn } from '@/lib/utils'
import { TradeCardThumb } from './trade-card-thumb'

export type Selection = Record<string, number>

function sortByName(a: CollectedCard, b: CollectedCard) {
  return a.name.localeCompare(b.name)
}

export function SelectableCardGrid({
  collection,
  selection,
  onChange,
  emptyLabel = 'No cards to choose from.',
  compareOwnedIds,
  filterLabel,
  compareBadge,
  filterEmptyLabel = 'Nothing new to show here.',
}: {
  collection: CollectionData
  selection: Selection
  onChange: (cardId: string, quantity: number) => void
  emptyLabel?: string
  /** Card ids owned by the other side of the trade. When provided, enables the
   *  "only cards the other side doesn't own" filter and ownership markers. */
  compareOwnedIds?: Set<string>
  /** Label for the ownership filter toggle. */
  filterLabel?: string
  /** Small marker shown on cards the other side already owns. */
  compareBadge?: string
  /** Message shown when the ownership filter hides every card. */
  filterEmptyLabel?: string
}) {
  const [query, setQuery] = useState('')
  const [onlyNew, setOnlyNew] = useState(true)

  const canCompare = compareOwnedIds !== undefined

  const cards = useMemo(
    () => Object.values(collection.cards).sort(sortByName),
    [collection],
  )

  const overlapCount = useMemo(() => {
    if (!compareOwnedIds) return 0
    return cards.reduce((n, c) => n + (compareOwnedIds.has(c.id) ? 1 : 0), 0)
  }, [cards, compareOwnedIds])

  const filterActive = canCompare && onlyNew

  const filtered = useMemo(() => {
    let list = cards
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q))
    if (filterActive && compareOwnedIds) {
      list = list.filter((c) => !compareOwnedIds.has(c.id))
    }
    return list
  }, [cards, query, filterActive, compareOwnedIds])

  if (cards.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter cards…"
            aria-label="Filter cards"
            className="w-full rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {canCompare && overlapCount > 0 && (
          <button
            type="button"
            onClick={() => setOnlyNew((v) => !v)}
            aria-pressed={onlyNew}
            className={cn(
              'shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
              onlyNew
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {filterLabel ?? 'Only new'}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          {filterActive && overlapCount > 0
            ? filterEmptyLabel
            : 'No cards match that search.'}
        </p>
      ) : (
        <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
          {filtered.map((card) => (
            <CardCell
              key={card.id}
              card={card}
              quantity={selection[card.id] ?? 0}
              onChange={onChange}
              compareOwned={compareOwnedIds?.has(card.id) ?? false}
              compareBadge={compareBadge}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CardCell({
  card,
  quantity,
  onChange,
  compareOwned = false,
  compareBadge,
}: {
  card: CollectedCard
  quantity: number
  onChange: (cardId: string, quantity: number) => void
  compareOwned?: boolean
  compareBadge?: string
}) {
  const selected = quantity > 0
  const max = card.count

  const clamp = (n: number) => Math.max(0, Math.min(max, n))

  return (
    <div className="space-y-1">
      <div className="relative">
        <TradeCardThumb
          card={card}
          quantity={selected ? quantity : undefined}
          selected={selected}
          onClick={() => onChange(card.id, selected ? 0 : 1)}
        />
        {compareOwned && compareBadge && (
          <span className="pointer-events-none absolute left-1 top-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white/90 backdrop-blur">
            {compareBadge}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[0.65rem] text-muted-foreground">
          own ×{card.count}
        </span>
        {selected && max > 1 && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => onChange(card.id, clamp(quantity - 1))}
              className="flex size-4 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"
            >
              <Minus className="size-2.5" />
            </button>
            <span
              className={cn(
                'min-w-4 text-center text-[0.7rem] font-bold',
                quantity >= max ? 'text-primary' : 'text-foreground',
              )}
            >
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => onChange(card.id, clamp(quantity + 1))}
              disabled={quantity >= max}
              className="flex size-4 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <Plus className="size-2.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
