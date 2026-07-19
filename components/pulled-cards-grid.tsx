'use client'

import { useState } from 'react'
import { RotateCw, LayoutGrid } from 'lucide-react'
import type { PokemonCard } from '@/lib/pokemon'
import type { PackDef } from '@/lib/packs'
import type { PackType } from '@/lib/god-pack'
import { TIER_META } from '@/lib/rarity'
import { PokeCardFace } from './poke-card'
import { GodPackBanner } from './god-pack-banner'
import { CardZoomModal } from './card-zoom-modal'
import { Button } from '@/components/ui/button'

const TIER_ORDER = ['ultra', 'rare', 'uncommon', 'common'] as const

export function PulledCardsGrid({
  cards,
  pack,
  bestTier,
  packType = 'normal',
  onOpenAnother,
  onChangePack,
}: {
  cards: PokemonCard[]
  pack: PackDef
  bestTier: PokemonCard['tier']
  packType?: PackType
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
      <GodPackBanner packType={packType} />
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
            aria-label={`View ${card.name}`}
            className="animate-card-in rounded-xl transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

      <CardZoomModal card={active} onClose={() => setActive(null)} />
    </div>
  )
}
