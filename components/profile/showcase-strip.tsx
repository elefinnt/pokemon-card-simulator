'use client'

import { Sparkles } from 'lucide-react'
import type { ShowcaseCard } from '@/lib/profile-types'
import { SHOWCASE_MAX } from '@/lib/profile-types'
import { TradeCardThumb } from '@/components/trades/trade-card-thumb'
import { cn } from '@/lib/utils'

/**
 * Read-only display of a player's showcase (up to three favourite cards).
 * Empty slots render as dashed placeholders so the layout stays balanced.
 */
export function ShowcaseStrip({
  cards,
  emptyLabel = 'No cards showcased yet.',
  showPlaceholders = true,
  className,
}: {
  cards: ShowcaseCard[]
  emptyLabel?: string
  showPlaceholders?: boolean
  className?: string
}) {
  if (cards.length === 0 && !showPlaceholders) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  const slots = showPlaceholders
    ? SHOWCASE_MAX
    : Math.min(cards.length, SHOWCASE_MAX)

  return (
    <div className={cn('grid grid-cols-3 gap-2.5', className)}>
      {Array.from({ length: slots }).map((_, i) => {
        const card = cards[i]
        if (!card) {
          return (
            <div
              key={`empty-${i}`}
              className="flex aspect-[2.5/3.5] items-center justify-center rounded-lg border border-dashed border-border bg-card/40 text-muted-foreground/50"
            >
              <Sparkles className="size-5" />
            </div>
          )
        }
        return <TradeCardThumb key={card.id} card={card} />
      })}
    </div>
  )
}
