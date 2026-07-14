import { PackSimulator } from '@/components/pack-simulator'
import { Pokeball } from '@/components/poke-card'

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{
          background:
            'radial-gradient(circle at 50% -10%, color-mix(in oklab, var(--primary) 30%, transparent), transparent 60%)',
        }}
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <Pokeball className="h-7 w-7" />
          <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
            PackRip
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          Card data by pokemontcg.io
        </span>
      </header>

      <PackSimulator />
    </main>
  )
}
