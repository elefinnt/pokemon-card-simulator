'use client'

import { type PackDef, packLogo, packSymbol } from '@/lib/packs'
import type { SetSummary } from '@/lib/collection'

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
  const hasProgress = !!summary && summary.packsOpened > 0
  const pct =
    summary && summary.poolTotal > 0
      ? Math.round(summary.completion * 100)
      : 0

  return (
    <button
      type="button"
      onClick={() => onSelect(pack)}
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
          src={packLogo(pack.id) || '/placeholder.svg'}
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
          src={packSymbol(pack.id) || '/placeholder.svg'}
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

      {hasProgress ? (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">
              {summary!.uniqueOwned}
              <span className="text-muted-foreground/60">
                {' / '}
                {summary!.poolTotal || '?'} collected
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
          <p className="mt-1.5 text-[0.7rem] text-muted-foreground">
            {summary!.packsOpened} pack{summary!.packsOpened === 1 ? '' : 's'}{' '}
            opened · {summary!.duplicates} dupes
          </p>
        </div>
      ) : (
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {requiresSignIn ? 'Preview pack' : 'Open pack'} &rarr;
        </span>
      )}
    </button>
  )
}
