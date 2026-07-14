'use client'

import { useMemo, useState } from 'react'
import { type PackDef, seriesOptions } from '@/lib/packs'
import type { CollectionData } from '@/lib/collection'
import { summarizeSet } from '@/lib/collection'
import { PackTile } from './pack-tile'
import { cn } from '@/lib/utils'

export function PackPicker({
  packs,
  collection,
  onSelect,
}: {
  packs: PackDef[]
  collection: CollectionData
  onSelect: (pack: PackDef) => void
}) {
  const [series, setSeries] = useState<string>('All')
  const seriesList = useMemo(() => seriesOptions(packs), [packs])

  const filtered =
    series === 'All' ? packs : packs.filter((p) => p.series === series)

  return (
    <div className="space-y-5">
      <div
        role="group"
        aria-label="Filter by series"
        className="flex flex-wrap justify-center gap-2"
      >
        <FilterChip
          label="All series"
          active={series === 'All'}
          onClick={() => setSeries('All')}
        />
        {seriesList.map((s) => (
          <FilterChip
            key={s}
            label={s}
            active={series === s}
            onClick={() => setSeries(s)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No packs match this filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pack) => (
            <PackTile
              key={pack.id}
              pack={pack}
              onSelect={onSelect}
              summary={summarizeSet(collection, pack.id, pack.total)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({
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
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}
