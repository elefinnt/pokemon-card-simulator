'use client'

import { useEffect, useMemo, useState } from 'react'
import { type PackDef } from '@/lib/packs'
import {
  type CollectionData,
  type CollectedCard,
  type BinderCard,
  binderCardsForSet,
  cardsForSet,
  summarizeSet,
} from '@/lib/collection'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SetCardFilterBar } from '@/components/collection/set-card-filter-bar'
import { CollectionCardThumb } from '@/components/collection/collection-card-thumb'
import { useSetCatalogue } from '@/components/use-set-catalogue'
import {
  DEFAULT_SET_CARD_FILTERS,
  filterSetCards,
  type SetCardFilters,
} from '@/lib/set-card-filters'
import {
  binderGroupsForPack,
  type BinderGroup,
} from '@/lib/set-companions'

type PackCardView = 'obtained' | 'all'

export function PackSection({
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
  const groups = binderGroupsForPack(pack.id)
  const pct =
    summary.poolTotal > 0 ? Math.round(summary.completion * 100) : 0

  return (
    <section className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pack.symbol || '/placeholder.svg'}
          alt=""
          aria-hidden="true"
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

      <div className="mt-4 flex items-center justify-end">
        <PackCardViewToggle value={cardView} onChange={setCardView} />
      </div>

      {groups ? (
        <div className="mt-5 space-y-8">
          {groups.map((group) => (
            <BinderGroupGrid
              key={group.setId}
              group={group}
              cardView={cardView}
              ownedCards={ownedCards.filter((card) => card.setId === group.setId)}
              binderCards={binderCards.filter((card) => card.setId === group.setId)}
              loading={loading}
              error={error}
              collection={collection}
              onSelectCard={onSelectCard}
            />
          ))}
        </div>
      ) : (
        <SingleSetGrid
          cardView={cardView}
          ownedCards={ownedCards}
          binderCards={binderCards}
          loading={loading}
          error={error}
          collection={collection}
          summaryOwned={summary.uniqueOwned}
          summaryTotal={summary.poolTotal}
          onSelectCard={onSelectCard}
        />
      )}
    </section>
  )
}

function SingleSetGrid({
  cardView,
  ownedCards,
  binderCards,
  loading,
  error,
  collection,
  summaryOwned,
  summaryTotal,
  onSelectCard,
}: {
  cardView: PackCardView
  ownedCards: CollectedCard[]
  binderCards: BinderCard[]
  loading: boolean
  error: boolean
  collection: CollectionData
  summaryOwned: number
  summaryTotal: number
  onSelectCard: (card: CollectedCard) => void
}) {
  const sourceCards =
    cardView === 'obtained'
      ? ownedCards.map((card) => ({ ...card, owned: true as const }))
      : binderCards

  return (
    <CardGrid
      sourceCards={sourceCards}
      cardView={cardView}
      loading={loading}
      error={error}
      collection={collection}
      countLabel={
        cardView === 'obtained'
          ? `${ownedCards.length} obtained`
          : `${summaryOwned} / ${summaryTotal || '?'} in set`
      }
      onSelectCard={onSelectCard}
    />
  )
}

function BinderGroupGrid({
  group,
  cardView,
  ownedCards,
  binderCards,
  loading,
  error,
  collection,
  onSelectCard,
}: {
  group: BinderGroup
  cardView: PackCardView
  ownedCards: CollectedCard[]
  binderCards: BinderCard[]
  loading: boolean
  error: boolean
  collection: CollectionData
  onSelectCard: (card: CollectedCard) => void
}) {
  const poolTotal =
    cardView === 'all' && binderCards.length > 0
      ? binderCards.length
      : group.total
  const uniqueOwned = ownedCards.length
  const pct = poolTotal > 0 ? Math.round((uniqueOwned / poolTotal) * 100) : 0
  const sourceCards =
    cardView === 'obtained'
      ? ownedCards.map((card) => ({ ...card, owned: true as const }))
      : binderCards

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h4 className="font-display text-base font-extrabold text-foreground">
            {group.label}
          </h4>
          <p className="text-xs text-muted-foreground">
            {uniqueOwned} / {poolTotal || '?'} unique
          </p>
        </div>
        <span className="text-sm font-bold text-primary">{pct}%</span>
      </div>
      {poolTotal > 0 && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary/80 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <CardGrid
        sourceCards={sourceCards}
        cardView={cardView}
        loading={loading}
        error={error}
        collection={collection}
        countLabel={
          cardView === 'obtained'
            ? `${ownedCards.length} obtained`
            : `${uniqueOwned} / ${poolTotal || '?'} in set`
        }
        emptyObtained={`No ${group.label} cards yet. Open 30th Celebration packs to hunt them.`}
        onSelectCard={onSelectCard}
      />
    </div>
  )
}

function CardGrid({
  sourceCards,
  cardView,
  loading,
  error,
  collection,
  countLabel,
  emptyObtained = 'No cards obtained from this set yet.',
  onSelectCard,
}: {
  sourceCards: BinderCard[]
  cardView: PackCardView
  loading: boolean
  error: boolean
  collection: CollectionData
  countLabel: string
  emptyObtained?: string
  onSelectCard: (card: CollectedCard) => void
}) {
  const [filters, setFilters] = useState<SetCardFilters>(DEFAULT_SET_CARD_FILTERS)
  const displayedCards = useMemo(
    () => filterSetCards(sourceCards, filters),
    [sourceCards, filters],
  )

  useEffect(() => {
    if (filters.tier === 'all') return
    const tierStillPresent = sourceCards.some((card) => card.tier === filters.tier)
    if (!tierStillPresent) {
      setFilters((current) => ({ ...current, tier: 'all' }))
    }
  }, [sourceCards, filters.tier])

  const showCatalogueLoading =
    cardView === 'all' && loading && displayedCards.length === 0

  return (
    <>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {countLabel}
          {displayedCards.length !== sourceCards.length && (
            <span>
              {' '}
              · showing {displayedCards.length}
            </span>
          )}
        </p>
      </div>

      {sourceCards.length > 0 && (
        <div className="mt-3">
          <SetCardFilterBar
            cards={sourceCards}
            filters={filters}
            onChange={setFilters}
          />
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {showCatalogueLoading ? (
          <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
            Loading set catalogue…
          </p>
        ) : displayedCards.length === 0 ? (
          <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
            {sourceCards.length === 0
              ? emptyObtained
              : 'No cards match the current filters.'}
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
    </>
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
