'use client'

import { Search, Sparkles } from 'lucide-react'
import type { CollectedCard } from '@/lib/collection'
import {
  type ShowcaseFilters,
  type SortMode,
  availableSets,
  availableTiers,
} from '@/lib/showcase-filters'
import { cn } from '@/lib/utils'

const SORT_LABELS: Record<SortMode, string> = {
  name: 'Name',
  rarity: 'Rarity',
  recent: 'Recent',
}

export function ShowcaseFilterBar({
  cards,
  filters,
  onChange,
}: {
  cards: CollectedCard[]
  filters: ShowcaseFilters
  onChange: (next: ShowcaseFilters) => void
}) {
  const tiers = availableTiers(cards)
  const sets = availableSets(cards)

  const set = <K extends keyof ShowcaseFilters>(
    key: K,
    value: ShowcaseFilters[K],
  ) => onChange({ ...filters, [key]: value })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-40">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set('query', e.target.value)}
            placeholder="Search by name…"
            aria-label="Search cards by name"
            className="w-full rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {sets.length > 1 && (
          <select
            value={filters.setId}
            onChange={(e) => set('setId', e.target.value)}
            aria-label="Filter by pack"
            className="rounded-lg border border-border bg-card py-1.5 pl-2.5 pr-7 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All packs</option>
            {sets.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} ({s.count})
              </option>
            ))}
          </select>
        )}

        <select
          value={filters.sort}
          onChange={(e) => set('sort', e.target.value as SortMode)}
          aria-label="Sort cards"
          className="rounded-lg border border-border bg-card py-1.5 pl-2.5 pr-7 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
            <option key={mode} value={mode}>
              Sort: {SORT_LABELS[mode]}
            </option>
          ))}
        </select>
      </div>

      <div
        role="group"
        aria-label="Filter by rarity"
        className="flex flex-wrap items-center gap-1.5"
      >
        <Chip
          label="All rarities"
          active={filters.tier === 'all'}
          onClick={() => set('tier', 'all')}
        />
        {tiers.map((t) => (
          <Chip
            key={t.value}
            label={`${t.label} (${t.count})`}
            active={filters.tier === t.value}
            onClick={() => set('tier', t.value)}
          />
        ))}
        <Chip
          label="Special"
          icon={<Sparkles className="size-3" />}
          active={filters.specialOnly}
          onClick={() => set('specialOnly', !filters.specialOnly)}
        />
      </div>
    </div>
  )
}

function Chip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon?: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
