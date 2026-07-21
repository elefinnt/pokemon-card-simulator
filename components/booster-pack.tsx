'use client'

import { cn } from '@/lib/utils'
import { type PackDef } from '@/lib/packs'
import { Pokeball } from './poke-card'

export function BoosterPack({
  pack,
  ripping,
  locked = false,
  onOpen,
}: {
  pack: PackDef
  ripping: boolean
  locked?: boolean
  onOpen: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-8">
      <button
        type="button"
        onClick={locked ? undefined : onOpen}
        disabled={ripping || locked}
        aria-label={
          locked
            ? `Sign in to open the ${pack.name} booster pack`
            : `Open the ${pack.name} booster pack`
        }
        className={cn(
          'group relative w-[240px] max-w-[70vw] select-none rounded-[1.75rem] transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default',
          locked
            ? 'cursor-not-allowed opacity-80'
            : 'cursor-pointer',
          ripping
            ? 'animate-rip-shake'
            : locked
              ? 'animate-float-slow'
              : 'animate-float-slow hover:scale-[1.03]',
        )}
      >
        {/* Glow */}
        <div
          className="absolute -inset-4 -z-10 rounded-[2.5rem] opacity-60 blur-2xl transition-opacity group-hover:opacity-90"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${pack.accentFrom}, transparent 70%)`,
          }}
        />

        {/* Wrapper */}
        <div
          className="relative flex aspect-[2.6/4] flex-col items-center justify-between overflow-hidden rounded-[1.75rem] border border-white/15 p-5 shadow-2xl"
          style={{
            background: `linear-gradient(160deg, ${pack.accentFrom}, ${pack.accentTo})`,
          }}
        >
          <div className="holo-shine" />

          {/* Crimp top */}
          <div className="relative z-10 flex w-full items-center justify-center gap-1.5 border-b border-dashed border-white/40 pb-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="h-2 w-1.5 rounded-sm bg-white/40" />
            ))}
          </div>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 py-4">
            <Pokeball className="h-10 w-10 opacity-90 drop-shadow" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pack.logo || '/placeholder.svg'}
              alt={`${pack.name} logo`}
              className="w-[80%] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]"
            />
            <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/90 backdrop-blur">
              Booster Pack
            </span>
          </div>

          <div className="relative z-10 w-full text-center text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/70">
            {pack.series}
          </div>
        </div>
      </button>

      <p className="text-sm font-medium text-muted-foreground">
        {ripping
          ? 'Ripping open…'
          : locked
            ? 'Sign in free for unlimited packs'
            : 'Tap the pack to rip it open'}
      </p>
    </div>
  )
}
