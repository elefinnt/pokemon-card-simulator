'use client'

import { useMemo, useState } from 'react'
import { Shuffle } from 'lucide-react'
import posthog from 'posthog-js'
import { type PackDef } from '@/lib/packs'
import type { CollectionData } from '@/lib/collection'
import { summarizeSet } from '@/lib/collection'
import { PackTile } from '@/components/pack-tile'
import { cn } from '@/lib/utils'

/**
 * The pack catalogue, one series at a time behind a segmented era switcher —
 * page height stays constant as the catalogue grows. A "Surprise me" button
 * gives undecided visitors an instant way in.
 */
export function SeriesShelf({
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
  // Order series newest-first so the freshest era leads.
  const orderedSeries = useMemo(() => {
    const latestYear = new Map<string, string>()
    for (const p of packs) {
      const current = latestYear.get(p.series)
      if (!current || p.year > current) latestYear.set(p.series, p.year)
    }
    return [...new Set(packs.map((p) => p.series))].sort((a, b) =>
      (latestYear.get(b) ?? '').localeCompare(latestYear.get(a) ?? ''),
    )
  }, [packs])

  const [selected, setSelected] = useState<string | null>(null)
  const active = selected ?? orderedSeries[0]
  const shelf = useMemo(
    () => packs.filter((p) => p.series === active),
    [packs, active],
  )

  const surpriseMe = () => {
    const pick = packs[Math.floor(Math.random() * packs.length)]
    if (!pick) return
    posthog.capture('surprise_pack_clicked', {
      set_id: pick.id,
      pack_slug: pick.slug,
      pack_name: pick.name,
      series: pick.series,
    })
    onSelect(pick)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div
          role="tablist"
          aria-label="Browse by series"
          className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {orderedSeries.map((s) => {
            const count = packs.filter((p) => p.series === s).length
            const isActive = s === active
            return (
              <button
                key={s}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  posthog.capture('series_tab_changed', {
                    series: s,
                    packs_in_series: count,
                  })
                  setSelected(s)
                }}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {s}
                <span
                  className={cn(
                    'text-[0.65rem] font-black',
                    isActive
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground/60',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={surpriseMe}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline-offset-4 hover:underline"
        >
          <Shuffle className="size-3.5" />
          Can&apos;t decide? Surprise me with a random pack
        </button>
      </div>

      <section className="space-y-3">
        <div className="flex items-baseline gap-2">
          <h2 className="font-display text-lg font-extrabold text-foreground">
            {active} Series
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {shelf.length} pack{shelf.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shelf.map((pack) => (
            <PackTile
              key={pack.id}
              pack={pack}
              onSelect={onSelect}
              summary={summarizeSet(collection, pack.id, pack.total)}
              requiresSignIn={requiresSignIn}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
