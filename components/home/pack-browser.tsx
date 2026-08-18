'use client'

import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import posthog from 'posthog-js'
import { type PackDef } from '@/lib/packs'
import type { CollectionData } from '@/lib/collection'
import { prefetchPool } from '@/lib/prefetch-pool'
import { Button } from '@/components/ui/button'
import { RequestPackCta } from '@/components/feedback/request-pack-cta'
import { SeriesShelf } from './series-shelf'

/**
 * Homepage pack catalogue: the newest set gets a full-width hero banner with
 * an instant rip CTA, and the rest of the catalogue sits below in the
 * one-series-at-a-time shelf, so the page stays short no matter how many
 * packs are live.
 */
export function PackBrowser({
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
  // The catalogue is ordered oldest-first, so on a year tie the later entry
  // is the more recent release — scan forwards keeping the newest seen.
  const featured = useMemo(
    () =>
      packs.reduce<PackDef | undefined>(
        (best, p) => (!best || p.year >= best.year ? p : best),
        undefined,
      ),
    [packs],
  )

  if (!featured) return null

  return (
    <div className="space-y-10">
      {/* Featured set banner */}
      <section
        className="relative overflow-hidden rounded-3xl border border-border"
        style={{
          background: `linear-gradient(135deg, ${featured.accentFrom}, ${featured.accentTo})`,
        }}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-black/30" />
        <div className="holo-shine opacity-50" />

        <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-8 text-center sm:flex-row sm:px-10 sm:py-10 sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={featured.logo || '/placeholder.svg'}
            alt={`${featured.name} logo`}
            className="h-24 w-auto max-w-[14rem] animate-float-slow object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.55)] sm:h-32 sm:max-w-[16rem]"
          />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-white backdrop-blur">
              <Sparkles className="size-3" />
              Latest set
            </span>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight text-white drop-shadow sm:text-4xl">
              {featured.name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-white/80">
              {featured.series} Series · {featured.year}
            </p>
            <p className="mt-2 max-w-xl text-pretty text-sm text-white/90">
              {featured.blurb}
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => {
              posthog.capture('featured_pack_cta_clicked', {
                set_id: featured.id,
                pack_slug: featured.slug,
                pack_name: featured.name,
                series: featured.series,
              })
              onSelect(featured)
            }}
            onPointerEnter={() => prefetchPool(featured.id)}
            className="shrink-0 px-6 font-semibold shadow-lg"
          >
            {requiresSignIn ? 'Preview this pack' : 'Rip this pack'}
          </Button>
        </div>
      </section>

      {/* One series at a time behind the segmented switcher */}
      <SeriesShelf
        packs={packs}
        collection={collection}
        onSelect={onSelect}
        requiresSignIn={requiresSignIn}
      />

      <RequestPackCta />
    </div>
  )
}
