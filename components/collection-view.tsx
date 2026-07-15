'use client'

import { useMemo, useState } from 'react'
import { LibraryBig, Layers, Copy, Sparkles, Trash2, Search } from 'lucide-react'
import { type PackDef, packSymbol } from '@/lib/packs'
import {
  type CollectionData,
  type CollectedCard,
  type BinderCard,
  binderCardsForSet,
  cardsForSet,
  searchCards,
  summarizeSet,
} from '@/lib/collection'
import { TIER_META } from '@/lib/rarity'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CardDetailModal } from './card-detail-modal'
import { SignInPrompt } from './sign-in-prompt'
import { useSetCatalogue } from './use-set-catalogue'

export function CollectionView({
  packs,
  collection,
  onOpenPack,
  onReset,
  requiresSignIn = false,
}: {
  packs: PackDef[]
  collection: CollectionData
  onOpenPack: (pack: PackDef) => void
  onReset: () => void | Promise<void>
  requiresSignIn?: boolean
}) {
  const [confirmReset, setConfirmReset] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CollectedCard | null>(null)
  const [query, setQuery] = useState('')

  const packById = useMemo(
    () => new Map(packs.map((p) => [p.id, p])),
    [packs],
  )

  const uniqueOwned = Object.keys(collection.cards).length
  const searchResults = useMemo(
    () => searchCards(collection, query),
    [collection, query],
  )
  const isSearching = query.trim().length > 0

  // Show a set if any pack was opened from it OR the user owns a card in it
  // (e.g. a card received through a trade from a set they never opened).
  const ownedSetIds = useMemo(
    () => new Set(Object.values(collection.cards).map((c) => c.setId)),
    [collection],
  )
  const collectedPacks = packs.filter(
    (p) =>
      (collection.sets[p.id]?.packsOpened ?? 0) > 0 || ownedSetIds.has(p.id),
  )

  if (uniqueOwned === 0) {
    if (requiresSignIn) {
      return (
        <SignInPrompt
          title="Your binder is waiting"
          description="Sign in with Discord to start opening packs. Every card you pull will be tracked here, duplicates and all."
        />
      )
    }

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
      <div className="relative mx-auto max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your collection…"
          aria-label="Search collection"
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

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

      {isSearching ? (
        <SearchResults
          results={searchResults}
          packById={packById}
          onSelectCard={setSelectedCard}
        />
      ) : (
        collectedPacks.map((pack) => (
          <PackSection
            key={pack.id}
            pack={pack}
            collection={collection}
            onOpenPack={onOpenPack}
            onSelectCard={setSelectedCard}
            requiresSignIn={requiresSignIn}
          />
        ))
      )}

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
                void onReset()
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

function SearchResults({
  results,
  packById,
  onSelectCard,
}: {
  results: CollectedCard[]
  packById: Map<string, PackDef>
  onSelectCard: (card: CollectedCard) => void
}) {
  if (results.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No cards match your search.
      </p>
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
      <h3 className="font-display text-lg font-extrabold text-foreground">
        Search results
        <span className="ml-2 text-sm font-semibold text-muted-foreground">
          ({results.length})
        </span>
      </h3>
      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {results.map((card) => (
          <CollectionCardThumb
            key={card.id}
            card={card}
            subtitle={packById.get(card.setId)?.name ?? card.setId}
            onSelect={() => onSelectCard(card)}
          />
        ))}
      </div>
    </section>
  )
}

type PackCardView = 'obtained' | 'all'

function PackSection({
  pack,
  collection,
  onOpenPack,
  onSelectCard,
  requiresSignIn = false,
}: {
  pack: PackDef
  collection: CollectionData
  onOpenPack: (pack: PackDef) => void
  onSelectCard: (card: CollectedCard) => void
  requiresSignIn?: boolean
}) {
  const [cardView, setCardView] = useState<PackCardView>('obtained')
  const summary = summarizeSet(collection, pack.id, pack.total)
  const ownedCards = cardsForSet(collection, pack.id)
  const { cards: catalogue, loading, error } = useSetCatalogue(pack.id)
  const binderCards = catalogue
    ? binderCardsForSet(catalogue, collection, pack.id)
    : ownedCards.map((card) => ({ ...card, owned: true as const }))
  const displayedCards =
    cardView === 'obtained'
      ? ownedCards.map((card) => ({ ...card, owned: true as const }))
      : binderCards
  const showCatalogueLoading =
    cardView === 'all' && loading && displayedCards.length === 0
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
            {requiresSignIn ? 'Preview pack' : 'Open more'}
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

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {cardView === 'obtained'
            ? `${ownedCards.length} obtained`
            : `${summary.uniqueOwned} / ${summary.poolTotal || '?'} in set`}
        </p>
        <PackCardViewToggle value={cardView} onChange={setCardView} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {showCatalogueLoading ? (
          <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
            Loading set catalogue…
          </p>
        ) : displayedCards.length === 0 ? (
          <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
            No cards obtained from this set yet.
          </p>
        ) : (
          displayedCards.map((card) => (
            <CollectionCardThumb
              key={card.id}
              card={card}
              onSelect={
                card.owned && collection.cards[card.id]
                  ? () => onSelectCard(collection.cards[card.id])
                  : undefined
              }
            />
          ))
        )}
      </div>
      {error && cardView === 'all' && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Could not load the full set — showing owned cards only.
        </p>
      )}
    </section>
  )
}

function PackCardViewToggle({
  value,
  onChange,
}: {
  value: PackCardView
  onChange: (value: PackCardView) => void
}) {
  return (
    <div
      role="group"
      aria-label="Card view"
      className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5"
    >
      {(
        [
          ['obtained', 'Obtained'],
          ['all', 'All cards'],
        ] as const
      ).map(([mode, label]) => (
        <button
          key={mode}
          type="button"
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
            value === mode
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function CollectionCardThumb({
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
          crossOrigin="anonymous"
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
