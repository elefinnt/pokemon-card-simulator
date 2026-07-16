'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PackDef } from '@/lib/packs'
import type { CollectionData } from '@/lib/collection'
import { summarizeSet } from '@/lib/collection'
import { PackTile } from './pack-tile'

export function PackSeriesRow({
  series,
  packs,
  collection,
  onSelect,
  requiresSignIn = false,
}: {
  series: string
  packs: PackDef[]
  collection: CollectionData
  onSelect: (pack: PackDef) => void
  requiresSignIn?: boolean
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollByPage = (dir: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="font-display text-lg font-extrabold text-foreground">
            {series} Series
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {packs.length} pack{packs.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="hidden gap-1 sm:flex">
          <ScrollButton direction="left" onClick={() => scrollByPage(-1)} />
          <ScrollButton direction="right" onClick={() => scrollByPage(1)} />
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {packs.map((pack) => (
          <div
            key={pack.id}
            className="w-[15rem] shrink-0 snap-start sm:w-[16rem]"
          >
            <PackTile
              pack={pack}
              onSelect={onSelect}
              summary={summarizeSet(collection, pack.id, pack.total)}
              requiresSignIn={requiresSignIn}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function ScrollButton({
  direction,
  onClick,
}: {
  direction: 'left' | 'right'
  onClick: () => void
}) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="size-4" />
    </button>
  )
}
