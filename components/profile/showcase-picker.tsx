'use client'

import { Check } from 'lucide-react'
import type { CollectedCard } from '@/lib/collection'
import { SHOWCASE_MAX } from '@/lib/profile-types'
import { TradeCardThumb } from '@/components/trades/trade-card-thumb'
import { cn } from '@/lib/utils'

export function ShowcasePicker({
  cards,
  selectedIds,
  picking,
  onAdd,
}: {
  cards: CollectedCard[]
  selectedIds: string[]
  picking: boolean
  onAdd: (id: string) => void
}) {
  const selectedSet = new Set(selectedIds)
  const atLimit = selectedIds.length >= SHOWCASE_MAX

  if (cards.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-muted-foreground">
        No cards match these filters.
      </p>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl transition-shadow',
        picking && 'ring-2 ring-primary/70 ring-offset-2 ring-offset-background',
      )}
    >
      <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
        {cards.map((card) => {
          const isSelected = selectedSet.has(card.id)
          const blocked = !isSelected && atLimit
          return (
            <div key={card.id} className="relative">
              <TradeCardThumb
                card={card}
                quantity={card.count > 1 ? card.count : undefined}
                selected={isSelected}
                dimmed={blocked}
                onClick={
                  isSelected || blocked ? undefined : () => onAdd(card.id)
                }
              />
              {isSelected && (
                <span className="pointer-events-none absolute bottom-1 right-1 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Check className="size-3" aria-hidden />
                  <span className="sr-only">In showcase</span>
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
