'use client'

import type { BinderCard } from '@/lib/collection-types'
import {
  type SetCardFilters,
  type SetCardSort,
  availableSetTiers,
} from '@/lib/set-card-filters'
import { cn } from '@/lib/utils'

const SORT_OPTIONS: { value: SetCardSort; label: string }[] = [
  { value: 'number', label: 'Card number' },
  { value: 'name', label: 'Alphabetical' },
]

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
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
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

      <div
        role="group"
        aria-label="Sort cards"
        className="inline-flex shrink-0 rounded-lg border border-border bg-muted/40 p-0.5"
      >
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filters.sort === option.value}
            onClick={() => set('sort', option.value)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
              filters.sort === option.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
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
