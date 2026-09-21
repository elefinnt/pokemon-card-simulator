'use client'

import { useMemo, useState } from 'react'
import { LibraryBig, Layers, Copy, Sparkles, Trash2, Search } from 'lucide-react'
import { type PackDef } from '@/lib/packs'
import {
  type CollectionData,
  type CollectedCard,
  searchCards,
  summarizeSet,
} from '@/lib/collection'
import { Button } from '@/components/ui/button'
import { CardDetailModal } from './card-detail-modal'
import { SignInPrompt } from './sign-in-prompt'
import { PackSection } from './collection/pack-section'
import { CollectionCardThumb } from './collection/collection-card-thumb'
import { CollectionSetFilter } from './collection/collection-set-filter'
import { BINDER_COMPANION_SETS, binderSetIds } from '@/lib/set-companions'
import { setLabel } from '@/lib/showcase-filters'

export function CollectionView({
  packs,
  collection,
  onOpenPack,
  onReset,
  requiresSignIn = false,
  setFilter = 'all',
  onSetFilter,
}: {
  packs: PackDef[]
  collection: CollectionData
  onOpenPack: (pack: PackDef) => void
  onReset: () => void | Promise<void>
  requiresSignIn?: boolean
  setFilter?: string
  onSetFilter?: (setId: string) => void
}) {
  const [confirmReset, setConfirmReset] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CollectedCard | null>(null)
  const [query, setQuery] = useState('')
  const [localFilter, setLocalFilter] = useState(setFilter)
  const activeFilter = onSetFilter ? setFilter : localFilter
  const changeFilter = onSetFilter ?? setLocalFilter

  const packById = useMemo(
    () => new Map(packs.map((p) => [p.id, p])),
    [packs],
  )

  const uniqueOwned = Object.keys(collection.cards).length
  const searchResults = useMemo(() => {
    const results = searchCards(collection, query)
    if (activeFilter === 'all') return results
    const ids = new Set(binderSetIds(activeFilter))
    return results.filter((c) => ids.has(c.setId))
  }, [collection, query, activeFilter])
  const isSearching = query.trim().length > 0

  // Show a set if any pack was opened from it OR the user owns a card in it
  // (e.g. a card received through a trade from a set they never opened).
  const ownedSetIds = useMemo(
    () => new Set(Object.values(collection.cards).map((c) => c.setId)),
    [collection],
  )
  const collectedPacks = packs.filter((p) => {
    if ((collection.sets[p.id]?.packsOpened ?? 0) > 0) return true
    if (ownedSetIds.has(p.id)) return true
    return (BINDER_COMPANION_SETS[p.id] ?? []).some(
      (id) =>
        ownedSetIds.has(id) || (collection.sets[id]?.packsOpened ?? 0) > 0,
    )
  })

  const setOptions = collectedPacks.map((pack) => ({
    pack,
    uniqueOwned: summarizeSet(collection, pack.id, pack.total).uniqueOwned,
  }))
  if (
    activeFilter !== 'all' &&
    !setOptions.some((o) => o.pack.id === activeFilter)
  ) {
    const extra = packs.find((p) => p.id === activeFilter)
    if (extra) {
      setOptions.unshift({
        pack: extra,
        uniqueOwned: summarizeSet(collection, extra.id, extra.total)
          .uniqueOwned,
      })
    }
  }

  const visiblePacks =
    activeFilter === 'all'
      ? collectedPacks
      : collectedPacks.filter((p) => p.id === activeFilter)

  const filteredPack = packs.find((p) => p.id === activeFilter)

  if (uniqueOwned === 0) {
    if (requiresSignIn) {
      return (
        <SignInPrompt
          title="Your binder is waiting"
          description="Sign in free for unlimited packs. Every card you pull will be tracked here, duplicates and all."
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
      <div className="mx-auto max-w-md space-y-3">
        <div className="relative">
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
        <CollectionSetFilter
          options={setOptions}
          value={activeFilter}
          onChange={changeFilter}
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
      ) : visiblePacks.length > 0 ? (
        visiblePacks.map((pack) => (
          <PackSection
            key={pack.id}
            pack={pack}
            collection={collection}
            onOpenPack={onOpenPack}
            onSelectCard={setSelectedCard}
            requiresSignIn={requiresSignIn}
          />
        ))
      ) : (
        <EmptySetFilter
          packName={
            filteredPack?.name ??
            (activeFilter !== 'all' ? activeFilter : undefined)
          }
          onShowAll={() => changeFilter('all')}
          onOpenPack={
            filteredPack ? () => onOpenPack(filteredPack) : undefined
          }
        />
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

function EmptySetFilter({
  packName,
  onShowAll,
  onOpenPack,
}: {
  packName?: string
  onShowAll: () => void
  onOpenPack?: () => void
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <LibraryBig className="mx-auto size-9 text-muted-foreground" />
      <h3 className="mt-4 font-display text-lg font-extrabold text-foreground">
        Nothing from {packName ?? 'this set'} yet
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        You have not collected any cards from this set. Open a pack or switch
        back to all sets.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {onOpenPack && (
          <Button size="sm" onClick={onOpenPack}>
            Open a pack
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={onShowAll}>
          Show all sets
        </Button>
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
            subtitle={packById.get(card.setId)?.name ?? setLabel(card.setId)}
            onSelect={() => onSelectCard(card)}
          />
        ))}
      </div>
    </section>
  )
}
