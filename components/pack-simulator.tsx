'use client'

import { useCallback, useState } from 'react'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { PACKS, type PackDef } from '@/lib/packs'
import type { OpenedPack } from '@/lib/pokemon'
import { PackTile } from './pack-tile'
import { BoosterPack } from './booster-pack'
import { CardReveal } from './card-reveal'
import { PulledCardsGrid } from './pulled-cards-grid'
import { Button } from '@/components/ui/button'

type Stage = 'select' | 'sealed' | 'revealing' | 'summary'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function PackSimulator() {
  const [stage, setStage] = useState<Stage>('select')
  const [pack, setPack] = useState<PackDef | null>(null)
  const [opened, setOpened] = useState<OpenedPack | null>(null)
  const [ripping, setRipping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectPack = useCallback((p: PackDef) => {
    setPack(p)
    setOpened(null)
    setError(null)
    setStage('sealed')
  }, [])

  const rip = useCallback(async () => {
    if (!pack || ripping) return
    setRipping(true)
    setError(null)
    const started = Date.now()
    try {
      const res = await fetch(`/api/open/${pack.id}`)
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = (await res.json()) as OpenedPack
      // Keep the rip animation on screen for a beat.
      await delay(Math.max(0, 1200 - (Date.now() - started)))
      setOpened(data)
      setStage('revealing')
    } catch (err) {
      console.log('[v0] rip failed:', err instanceof Error ? err.message : err)
      setError('Could not reach the card server. Please try again.')
    } finally {
      setRipping(false)
    }
  }, [pack, ripping])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20">
      {stage === 'select' && (
        <section>
          <div className="mx-auto max-w-2xl pt-10 text-center sm:pt-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Pack Opening Simulator
            </span>
            <h1 className="mt-4 text-balance font-display text-4xl font-black leading-tight text-foreground sm:text-5xl">
              Rip open a <span className="text-primary">Pokémon</span> booster
            </h1>
            <p className="mt-3 text-pretty text-muted-foreground">
              Pick a pack, tear it open, and reveal every card one by one. Chase
              the holos and hit that Ultra Rare.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PACKS.map((p) => (
              <PackTile key={p.id} pack={p} onSelect={selectPack} />
            ))}
          </div>
        </section>
      )}

      {stage === 'sealed' && pack && (
        <section className="flex flex-col items-center pt-8">
          <div className="mb-8 w-full">
            <Button
              variant="ghost"
              onClick={() => setStage('select')}
              className="text-muted-foreground"
            >
              <ArrowLeft className="size-4" />
              All packs
            </Button>
          </div>

          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-extrabold text-foreground">
              {pack.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {pack.series} Series · {pack.year}
            </p>
          </div>

          <div className="flex min-h-[26rem] items-center">
            <BoosterPack pack={pack} ripping={ripping} onOpen={rip} />
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-foreground">
              <AlertCircle className="size-4 text-primary" />
              {error}
            </div>
          )}
        </section>
      )}

      {stage === 'revealing' && pack && opened && (
        <section className="flex flex-col items-center pt-10">
          <CardReveal
            cards={opened.cards}
            pack={pack}
            onDone={() => setStage('summary')}
          />
        </section>
      )}

      {stage === 'summary' && pack && opened && (
        <section className="pt-10">
          <PulledCardsGrid
            cards={opened.cards}
            pack={pack}
            bestTier={opened.bestTier}
            onOpenAnother={() => {
              setOpened(null)
              setStage('sealed')
            }}
            onChangePack={() => setStage('select')}
          />
        </section>
      )}
    </div>
  )
}
