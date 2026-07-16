'use client'

import type { BinderCard } from '@/lib/collection-types'
import {
  type SetCardFilters,
  type SetCardSort,
  availableSetTiers,
} from '@/lib/set-card-filters'
import { cn } from '@/lib/utils'

const SORT_LABELS: Record<SetCardSort, string> = {
  number: 'Card number',
  name: 'Name',
  rarity: 'Rarity',
}

export function SetCardFilterBar({
  cards,
  filters,
  onChange,
}: {
  cards: BinderCard[]
  filters: SetCardFilters
  onChange: (next: SetCardFilters) => void
}) {
  const tiers = availableSetTiers(cards)

  const set = <K extends keyof SetCardFilters>(
    key: K,
    value: SetCardFilters[K],
  ) => onChange({ ...filters, [key]: value })

  if (tiers.length === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div
        role="group"
        aria-label="Filter by rarity"
        className="flex flex-wrap items-center gap-1.5"
      >
        <Chip
          label="All"
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
      </div>

      <select
        value={filters.sort}
        onChange={(e) => set('sort', e.target.value as SetCardSort)}
        aria-label="Sort cards"
        className="rounded-lg border border-border bg-card py-1.5 pl-2.5 pr-7 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {(Object.keys(SORT_LABELS) as SetCardSort[]).map((mode) => (
          <option key={mode} value={mode}>
            Sort: {SORT_LABELS[mode]}
          </option>
        ))}
      </select>
    </div>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
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
      {label}
    </button>
  )
}
