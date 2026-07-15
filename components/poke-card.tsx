'use client'

import { cn } from '@/lib/utils'
import type { PokemonCard } from '@/lib/pokemon'
import { TIER_META } from '@/lib/rarity'

interface PokeCardFaceProps {
  card: PokemonCard
  className?: string
  showShine?: boolean
}

/** The front face of a Pokémon card, including holo / rainbow foil overlays. */
export function PokeCardFace({
  card,
  className,
  showShine = true,
}: PokeCardFaceProps) {
  const meta = TIER_META[card.tier]
  return (
    <div
      className={cn(
        'relative aspect-[2.5/3.5] w-full overflow-hidden rounded-xl bg-muted shadow-lg',
        className,
      )}
      style={{
        boxShadow:
          card.tier === 'ultra' || card.tier === 'rare'
            ? `0 0 0 1px ${meta.color}55, 0 10px 30px -8px ${meta.color}66`
            : undefined,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.imageLarge || '/placeholder.svg'}
        alt={`${card.name} — ${card.rarity}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {card.rainbow && (
        <div className="holo-rainbow pointer-events-none absolute inset-0 rounded-xl" />
      )}
      {showShine && card.foil && <div className="holo-shine" />}
    </div>
  )
}

/** A generic, themed card back (no copyrighted art). */
export function PokeCardBack({
  className,
  accentFrom = '#f43f5e',
  accentTo = '#7f1d1d',
}: {
  className?: string
  accentFrom?: string
  accentTo?: string
}) {
  return (
    <div
      className={cn(
        'relative aspect-[2.5/3.5] w-full overflow-hidden rounded-xl shadow-lg',
        className,
      )}
      style={{
        background: `linear-gradient(150deg, ${accentFrom}, ${accentTo})`,
      }}
    >
      <div className="absolute inset-1.5 rounded-lg border border-white/25" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Pokeball className="h-1/3 w-auto opacity-90" />
      </div>
      <div className="absolute inset-x-0 bottom-3 text-center text-[0.6rem] font-bold uppercase tracking-[0.35em] text-white/70">
        PackRip
      </div>
    </div>
  )
}

/** A simple, decorative Poké Ball drawn with SVG. */
export function Pokeball({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Poké Ball"
    >
      <circle cx="50" cy="50" r="46" fill="#fff" stroke="#111" strokeWidth="4" />
      <path d="M4 50a46 46 0 0 1 92 0Z" fill="#ef4444" stroke="#111" strokeWidth="4" />
      <line x1="4" y1="50" x2="96" y2="50" stroke="#111" strokeWidth="4" />
      <circle cx="50" cy="50" r="15" fill="#fff" stroke="#111" strokeWidth="6" />
      <circle cx="50" cy="50" r="6" fill="#fff" stroke="#111" strokeWidth="3" />
    </svg>
  )
}
