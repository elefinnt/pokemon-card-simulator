'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PokemonCard } from '@/lib/pokemon'
import { TIER_META } from '@/lib/rarity'
import { TiltCard } from './tilt-card'

export function CardZoomModal({
  card,
  onClose,
}: {
  card: PokemonCard | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!card) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [card, onClose])

  if (!card) return null

  const meta = TIER_META[card.tier]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${card.name} details`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-[320px] flex-col items-center gap-4 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -right-2 -top-2 z-10 rounded-full bg-card p-2 text-foreground shadow-lg ring-1 ring-border transition-colors hover:bg-accent"
        >
          <X className="size-4" />
        </button>

        <TiltCard card={card} />

        <div className="w-full rounded-xl border border-border bg-card p-4 text-center">
          <h3 className="font-display text-xl font-extrabold text-card-foreground">
            {card.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span
              className={cn(
                'rounded-full border px-2.5 py-0.5 font-semibold',
                meta.badgeClass,
              )}
            >
              {card.rarity || meta.label}
            </span>
            {card.number && (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-muted-foreground">
                No. {card.number}
              </span>
            )}
          </div>
          {card.artist && (
            <p className="mt-3 text-xs text-muted-foreground">
              Illustrated by {card.artist}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
