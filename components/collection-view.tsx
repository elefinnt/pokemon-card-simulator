'use client'

import { useState } from 'react'
import { LibraryBig, Layers, Copy, Sparkles, Trash2 } from 'lucide-react'
import { PACKS, type PackDef, packLogo, packSymbol } from '@/lib/packs'
import {
  type CollectionData,
  type CollectedCard,
  cardsForSet,
  summarizeSet,
  resetCollection,
} from '@/lib/collection'
import { TIER_META } from '@/lib/rarity'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CardDetailModal } from './card-detail-modal'

export function CollectionView({
  collection,
  onOpenPack,
}: {
  collection: CollectionData
  onOpenPack: (pack: PackDef) => void
}) {
  const [confirmReset, setConfirmReset] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CollectedCard | null>(null)

  const uniqueOwned = Object.keys(collection.cards).length
  const collectedPacks = PACKS.filter(
    (p) => (collection.sets[p.id]?.packsOpened ?? 0) > 0,
  )

  if (uniqueOwned === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
        <LibraryBig className="mx-auto size-10 text-muted-foreground" />
        <h3 className="mt-4 font-display text-xl font-extrabold text-foreground">
          Your binder is empty
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Open a booster pack and every card you pull will be tracked here,
          duplicates and all.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Overall stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Layers className="size-4" />}
          label="Packs opened"
          value={collection.totalPacksOpened}
        />
        <StatCard
          icon={<Sparkles className="size-4" />}
          label="Cards pulled"
          value={collection.totalCardsPulled}
        />
        <StatCard
          icon={<LibraryBig className="size-4" />}
          label="Unique cards"
          value={uniqueOwned}
        />
        <StatCard
          icon={<Copy className="size-4" />}
          label="Duplicates"
          value={collection.totalCardsPulled - uniqueOwned}
        />
      </div>

      {/* Per-pack sections */}
      {collectedPacks.map((pack) => (
        <PackSection
          key={pack.id}
          pack={pack}
          collection={collection}
          onOpenPack={onOpenPack}
          onSelectCard={setSelectedCard}
        />
      ))}

      {/* Reset */}
      <div className="flex items-center justify-center pt-4">
        {confirmReset ? (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2">
            <span className="text-sm text-foreground">
              Erase your entire collection?
            </span>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                resetCollection()
                setConfirmReset(false)
              }}
            >
              Yes, reset
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmReset(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setConfirmReset(true)}
          >
            <Trash2 className="size-4" />
            Reset collection
          </Button>
        )}
      </div>

      <CardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-black text-foreground">
        {value.toLocaleString()}
      </div>
    </div>
  )
}

function PackSection({
  pack,
  collection,
  onOpenPack,
  onSelectCard,
}: {
  pack: PackDef
  collection: CollectionData
  onOpenPack: (pack: PackDef) => void
  onSelectCard: (card: CollectedCard) => void
}) {
  const summary = summarizeSet(collection, pack.id)
  const cards = cardsForSet(collection, pack.id)
  const pct =
    summary.poolTotal > 0 ? Math.round(summary.completion * 100) : 0

  return (
    <section className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={packSymbol(pack.id) || '/placeholder.svg'}
          alt=""
          aria-hidden="true"
          crossOrigin="anonymous"
          className="h-6 w-6 shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-extrabold leading-tight text-foreground">
            {pack.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {summary.uniqueOwned}
            {' / '}
            {summary.poolTotal || '?'} unique · {summary.packsOpened} pack
            {summary.packsOpened === 1 ? '' : 's'} · {summary.duplicates} dupes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-black text-primary">
            {pct}%
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onOpenPack(pack)}
          >
            Open more
          </Button>
        </div>
      </div>

      {summary.poolTotal > 0 && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {cards.map((card) => {
          const meta = TIER_META[card.tier]
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectCard(card)}
              aria-label={`View ${card.name}`}
              className="group relative rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div
                className={cn(
                  'relative overflow-hidden rounded-lg border bg-muted transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-lg',
                )}
                style={{
                  borderColor: card.count > 1 ? meta.color : undefined,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.imageSmall || '/placeholder.svg'}
                  alt={card.name}
                  crossOrigin="anonymous"
                  loading="lazy"
                  className="aspect-[2.5/3.5] w-full object-cover"
                />
                {card.count > 1 && (
                  <span
                    className="absolute right-1 top-1 rounded-md px-1.5 py-0.5 text-[0.7rem] font-black text-black shadow"
                    style={{ backgroundColor: meta.color }}
                  >
                    &times;{card.count}
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-center text-[0.7rem] text-muted-foreground">
                {card.name}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
