'use client'

import { TIER_META } from '@/lib/rarity'
import type { CardTier } from '@/lib/pokemon'
import { cn } from '@/lib/utils'

/** Minimal shape needed to render a card thumbnail in trade UI. */
export interface ThumbCard {
  name: string
  rarity: string
  tier: CardTier
  foil: boolean
  rainbow: boolean
  imageSmall: string
}

export function TradeCardThumb({
  card,
  quantity,
  selected = false,
  dimmed = false,
  onClick,
  className,
}: {
  card: ThumbCard
  quantity?: number
  selected?: boolean
  dimmed?: boolean
  onClick?: () => void
  className?: string
}) {
  const meta = TIER_META[card.tier]
  const interactive = typeof onClick === 'function'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      aria-pressed={interactive ? selected : undefined}
      className={cn(
        'group relative block aspect-[2.5/3.5] w-full overflow-hidden rounded-lg bg-muted transition-all',
        interactive && 'cursor-pointer hover:-translate-y-0.5',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        dimmed && 'opacity-45 grayscale',
        !interactive && 'cursor-default',
        className,
      )}
      style={
        selected
          ? undefined
          : { boxShadow: `inset 0 0 0 1px ${meta.color}44` }
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.imageSmall || '/placeholder.svg'}
        alt={`${card.name} — ${card.rarity}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {card.rainbow && (
        <div className="holo-rainbow pointer-events-none absolute inset-0" />
      )}
      {card.foil && (
        <div className="holo-shine pointer-events-none absolute inset-0" />
      )}
      {typeof quantity === 'number' && quantity > 1 && (
        <span
          className="absolute right-1 top-1 rounded-md px-1.5 py-0.5 text-[0.65rem] font-black text-white shadow-sm"
          style={{ backgroundColor: meta.color }}
        >
          ×{quantity}
        </span>
      )}
    </button>
  )
}
