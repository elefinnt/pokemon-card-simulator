'use client'

import { useEffect, useState } from 'react'
import { X, RotateCw, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PokemonCard } from '@/lib/pokemon'
import type { PackDef } from '@/lib/packs'
import { TIER_META } from '@/lib/rarity'
import { PokeCardFace } from './poke-card'
import { Button } from '@/components/ui/button'

const TIER_ORDER = ['ultra', 'rare', 'uncommon', 'common'] as const

export function PulledCardsGrid({
  cards,
  pack,
  bestTier,
  onOpenAnother,
  onChangePack,
}: {
  cards: PokemonCard[]
  pack: PackDef
  bestTier: PokemonCard['tier']
  onOpenAnother: () => void
  onChangePack: () => void
}) {
  const [active, setActive] = useState<PokemonCard | null>(null)
  const bestMeta = TIER_META[bestTier]

  // Sort so the good pulls come first.
  const sorted = [...cards].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
  )

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {pack.name} · {cards.length} cards
        </p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-foreground">
          Your Pulls
        </h2>
        <span
          className="mt-2 inline-block rounded-full border px-3 py-1 text-sm font-semibold"
          style={{
            color: bestMeta.color,
            borderColor: `${bestMeta.color}55`,
            background: `${bestMeta.color}18`,
          }}
        >
          Best pull: {bestMeta.label}
        </span>
      </div>

      <div className="grid w-full grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {sorted.map((card, i) => (
          <button
            key={card.id + i}
            type="button"
            onClick={() => setActive(card)}
            className="animate-card-in rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <PokeCardFace card={card} showShine={card.tier === 'ultra'} />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={onOpenAnother} className="font-semibold">
          <RotateCw className="size-4" />
          Open another {pack.name}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={onChangePack}
          className="font-semibold"
        >
          <LayoutGrid className="size-4" />
          Choose different pack
        </Button>
      </div>

      {active && (
        <CardModal card={active} onClose={() => setActive(null)} />
      )}
    </div>
  )
}

function CardModal({
  card,
  onClose,
}: {
  card: PokemonCard
  onClose: () => void
}) {
  const meta = TIER_META[card.tier]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

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

        <PokeCardFace card={card} className="w-full" />

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
