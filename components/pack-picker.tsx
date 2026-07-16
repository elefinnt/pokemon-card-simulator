'use client'

import { useMemo, useState } from 'react'
import { type PackDef, seriesOptions } from '@/lib/packs'
import type { CollectionData } from '@/lib/collection'
import { PackSeriesRow } from './pack-series-row'
import { cn } from '@/lib/utils'

export function PackPicker({
  packs,
  collection,
  onSelect,
  requiresSignIn = false,
}: {
  packs: PackDef[]
  collection: CollectionData
  onSelect: (pack: PackDef) => void
  requiresSignIn?: boolean
}) {
  const [series, setSeries] = useState<string>('All')
  const seriesList = useMemo(() => seriesOptions(packs), [packs])

  // Order series newest-first so the freshest sets lead the page.
  const orderedSeries = useMemo(() => {
    const latestYear = new Map<string, string>()
    for (const p of packs) {
      const current = latestYear.get(p.series)
      if (!current || p.year > current) latestYear.set(p.series, p.year)
    }
    return [...seriesList].sort((a, b) =>
      (latestYear.get(b) ?? '').localeCompare(latestYear.get(a) ?? ''),
    )
  }, [packs, seriesList])

  const groups = useMemo(() => {
    const visible = series === 'All' ? orderedSeries : [series]
    return visible
      .map((s) => ({ series: s, items: packs.filter((p) => p.series === s) }))
      .filter((g) => g.items.length > 0)
  }, [packs, series, orderedSeries])

  return (
    <div className="space-y-8">
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

      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No packs match this filter.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <PackSeriesRow
              key={g.series}
              series={g.series}
              packs={g.items}
              collection={collection}
              onSelect={onSelect}
              requiresSignIn={requiresSignIn}
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
