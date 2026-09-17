'use client'

import { TIER_META } from '@/lib/rarity'
import { cn } from '@/lib/utils'
import type { BinderCard, CollectedCard } from '@/lib/collection-types'

export function CollectionCardThumb({
  card,
  subtitle,
  onSelect,
}: {
  card: BinderCard | CollectedCard
  subtitle?: string
  onSelect?: () => void
}) {
  const meta = TIER_META[card.tier]
  const owned = 'owned' in card ? card.owned : true
  const count = card.count

  const inner = (
    <>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border bg-muted transition-transform duration-200',
          owned && 'group-hover:-translate-y-1 group-hover:shadow-lg',
        )}
        style={{
          borderColor: count > 1 ? meta.color : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.imageSmall || '/placeholder.svg'}
          alt={card.name}
          loading="lazy"
          className={cn(
            'aspect-[2.5/3.5] w-full object-cover transition-[filter,opacity]',
            !owned && 'grayscale opacity-45',
          )}
        />
        {count > 1 && (
          <span
            className="absolute right-1 top-1 rounded-md px-1.5 py-0.5 text-[0.7rem] font-black text-black shadow"
            style={{ backgroundColor: meta.color }}
          >
            &times;{count}
          </span>
        )}
      </div>
      <p
        className={cn(
          'mt-1 truncate text-center text-[0.7rem]',
          owned ? 'text-muted-foreground' : 'text-muted-foreground/50',
        )}
      >
        {card.name}
      </p>
      {subtitle && (
        <p className="truncate text-center text-[0.65rem] text-muted-foreground/70">
          {subtitle}
        </p>
      )}
    </>
  )

  if (!onSelect) {
    return (
      <div
        className="relative rounded-lg text-left"
        aria-label={`${card.name} — not collected`}
      >
        {inner}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`View ${card.name}`}
      className="group relative rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {inner}
    </button>
  )
}
