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
}: {
  collection: CollectionData
  selection: Selection
  onChange: (cardId: string, quantity: number) => void
  emptyLabel?: string
}) {
  const [query, setQuery] = useState('')

  const cards = useMemo(
    () => Object.values(collection.cards).sort(sortByName),
    [collection],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cards
    return cards.filter((c) => c.name.toLowerCase().includes(q))
  }, [cards, query])

  if (cards.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
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

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No cards match that search.
        </p>
      ) : (
        <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
          {filtered.map((card) => (
            <CardCell
              key={card.id}
              card={card}
              quantity={selection[card.id] ?? 0}
              onChange={onChange}
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
}: {
  card: CollectedCard
  quantity: number
  onChange: (cardId: string, quantity: number) => void
}) {
  const selected = quantity > 0
  const max = card.count

  const clamp = (n: number) => Math.max(0, Math.min(max, n))

  return (
    <div className="space-y-1">
      <TradeCardThumb
        card={card}
        quantity={selected ? quantity : undefined}
        selected={selected}
        onClick={() => onChange(card.id, selected ? 0 : 1)}
      />
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
