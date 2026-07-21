'use client'

import { type PackDef } from '@/lib/packs'
import { packPath } from '@/lib/nav'
import type { SetSummary } from '@/lib/collection'
import { prefetchPool } from '@/lib/prefetch-pool'

export function PackTile({
  pack,
  onSelect,
  summary,
  requiresSignIn = false,
}: {
  pack: PackDef
  onSelect: (pack: PackDef) => void
  summary?: SetSummary
  requiresSignIn?: boolean
}) {
  const pct =
    summary && summary.poolTotal > 0
      ? Math.round(summary.completion * 100)
      : 0
  const uniqueOwned = summary?.uniqueOwned ?? 0
  const poolTotal = summary?.poolTotal ?? pack.total
  const packsOpened = summary?.packsOpened ?? 0
  const duplicates = summary?.duplicates ?? 0

  return (
    // A real link (crawlable, open-in-new-tab friendly) that behaves like the
    // old button: selection stays client-side via history.pushState upstream.
    <a
      href={packPath(pack.slug)}
      onClick={(e) => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        onSelect(pack)
      }}
      onPointerEnter={() => prefetchPool(pack.id)}
      onFocus={() => prefetchPool(pack.id)}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Pack art */}
      <div
        className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl p-4"
        style={{
          background: `linear-gradient(150deg, ${pack.accentFrom}, ${pack.accentTo})`,
        }}
      >
        <div className="holo-shine opacity-70" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pack.logo || '/placeholder.svg'}
          alt={`${pack.name} logo`}
          className="relative z-10 max-h-[60%] w-auto max-w-[85%] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 z-10 rounded-full bg-black/30 px-2 py-0.5 text-[0.65rem] font-semibold text-white/90 backdrop-blur">
          {pack.year}
        </span>
      </div>

      {/* Info */}
      <div className="mt-3 flex items-start gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pack.symbol || '/placeholder.svg'}
          alt=""
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 shrink-0 object-contain"
        />
        <div className="min-w-0">
          <h3 className="font-display text-lg font-extrabold leading-tight text-card-foreground">
            {pack.name}
          </h3>
          <p className="text-xs text-muted-foreground">{pack.series} Series</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {pack.blurb}
      </p>

      {/* Progress stays hidden for a clean resting card and drops down on
          hover / keyboard focus. */}
      <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-300 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-visible:grid-rows-[1fr] group-focus-visible:opacity-100">
        <div className="overflow-hidden">
          <div className="pt-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">
                {uniqueOwned}
                <span className="text-muted-foreground/60">
                  {' / '}
                  {poolTotal || '?'} collected
                </span>
              </span>
              <span className="text-primary">{pct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[0.7rem] text-muted-foreground">
                {packsOpened > 0
                  ? `${packsOpened} pack${packsOpened === 1 ? '' : 's'} opened · ${duplicates} dupes`
                  : 'Not opened yet'}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                {requiresSignIn ? 'Preview' : 'Open'} &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}
