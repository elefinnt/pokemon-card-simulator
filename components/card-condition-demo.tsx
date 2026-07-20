'use client'

import { useMemo, useState } from 'react'
import {
  floatToCondition,
  formatFloat,
  PSA_BANDS,
  rollCardFloat,
  rollPatternSeed,
} from '@/lib/card-condition'
import { WornCardFace } from '@/components/worn-card-face'
import { cn } from '@/lib/utils'

/** Sample chase card for the wear preview (public CDN art). */
const DEMO_CARD = {
  name: 'Charizard ex',
  imageUrl: 'https://images.pokemontcg.io/sv3/223_hires.png',
}

export function CardConditionDemo() {
  const [float, setFloat] = useState(0.12)
  const [seed, setSeed] = useState(1337)
  const condition = useMemo(() => floatToCondition(float), [float])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Condition preview
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
          Float → PSA wear demo
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
          Like Counter-Strike skin floats: each pulled card gets a{' '}
          <span className="font-mono text-foreground">0.00–1.00</span> value.
          Lower float = better grade and less visible wear. Drag the slider to
          see how condition changes.
        </p>
      </header>

      {/* Interactive preview */}
      <section className="grid gap-8 rounded-2xl border border-border/70 bg-card/50 p-6 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start">
        <div className="mx-auto flex w-full max-w-[240px] flex-col gap-3">
          <WornCardFace
            imageUrl={DEMO_CARD.imageUrl}
            alt={DEMO_CARD.name}
            float={float}
            seed={seed}
            showFloatLabel
          />
          <button
            type="button"
            onClick={() => setSeed(rollPatternSeed())}
            className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Reroll wear pattern
            <span className="ml-1 font-mono text-[0.6rem] opacity-70">
              #{seed.toString(16).slice(0, 6)}
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Float value
              </p>
              <p className="font-mono text-4xl font-bold tabular-nums">
                {formatFloat(float)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                PSA grade
              </p>
              <p className="font-display text-4xl font-black text-primary">
                {condition.psaGrade}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Label
              </p>
              <p className="text-lg font-semibold">{condition.label}</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(float * 100)}
              onChange={(e) => setFloat(Number(e.target.value) / 100)}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
              aria-label="Condition float"
            />
            <div className="flex justify-between font-mono text-[0.65rem] text-muted-foreground">
              <span>0.00 — Gem Mint</span>
              <span>1.00 — Poor</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PSA_BANDS.map((band) => (
              <button
                key={band.grade}
                type="button"
                onClick={() => setFloat(band.sampleFloat)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  condition.psaGrade === band.grade
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted',
                )}
              >
                PSA {band.grade}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setFloat(rollCardFloat())}
              className="rounded-full border border-dashed border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Roll random float
            </button>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Float bands (example tuning)</p>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {PSA_BANDS.map((band) => (
                <li key={band.grade} className="font-mono text-xs">
                  PSA {band.grade}: {formatFloat(band.minFloat)} –{' '}
                  {band.grade === 1
                    ? formatFloat(band.maxFloat)
                    : formatFloat(band.maxFloat - 0.01)}{' '}
                  <span className="text-muted-foreground">({band.label})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* All 10 grades side by side */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold">All PSA grades</h2>
          <p className="text-sm text-muted-foreground">
            Representative float per band — each with its own wear pattern.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {PSA_BANDS.map((band) => (
            <button
              key={band.grade}
              type="button"
              onClick={() => setFloat(band.sampleFloat)}
              className="group rounded-xl border border-border/60 bg-card/40 p-3 text-left transition-colors hover:border-primary/50 hover:bg-card/70"
            >
              <WornCardFace
                imageUrl={DEMO_CARD.imageUrl}
                alt={`${DEMO_CARD.name} PSA ${band.grade}`}
                float={band.sampleFloat}
                seed={band.grade * 97 + 13}
                showGradeBadge
              />
              <div className="mt-3 space-y-0.5">
                <p className="font-display text-sm font-bold group-hover:text-primary">
                  PSA {band.grade}
                </p>
                <p className="text-xs text-muted-foreground">{band.label}</p>
                <p className="font-mono text-[0.65rem] text-muted-foreground">
                  float {formatFloat(band.sampleFloat)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Wear progression strip */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold">Wear progression</h2>
          <p className="text-sm text-muted-foreground">
            Same card at float steps from 0.00 to 1.00 — notice how overlays
            stack as the value climbs.
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((step, i) => {
            const stepCondition = floatToCondition(step)
            return (
              <div key={step} className="w-[120px] shrink-0">
                <WornCardFace
                  imageUrl={DEMO_CARD.imageUrl}
                  alt={`Float ${step}`}
                  float={step}
                  seed={i * 313 + 7}
                  showGradeBadge={false}
                  showFloatLabel
                />
                <p className="mt-2 text-center font-mono text-[0.65rem] text-muted-foreground">
                  PSA {stepCondition.psaGrade}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
