'use client'

import { useCallback, useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { cn } from '@/lib/utils'
import type { PokemonCard } from '@/lib/pokemon'
import type { PackDef } from '@/lib/packs'
import type { PackType } from '@/lib/god-pack'
import { TIER_META, isHit } from '@/lib/rarity'
import { PokeCardFace, PokeCardBack } from './poke-card'
import { GodPackBanner } from './god-pack-banner'
import { Button } from '@/components/ui/button'

function celebrate(tier: PokemonCard['tier']) {
  const colors =
    tier === 'ultra'
      ? ['#fbbf24', '#f59e0b', '#fde68a', '#ffffff']
      : ['#60a5fa', '#93c5fd', '#ffffff']
  const particles = tier === 'ultra' ? 160 : 90
  confetti({
    particleCount: particles,
    spread: tier === 'ultra' ? 100 : 70,
    startVelocity: 45,
    origin: { y: 0.45 },
    colors,
    scalar: tier === 'ultra' ? 1.15 : 0.9,
  })
}

/** A sustained multi-burst celebration reserved for god / demigod packs. */
function celebrateJackpot() {
  const colors = ['#fbbf24', '#f472b6', '#a855f7', '#38bdf8', '#ffffff']
  const bursts = 4
  for (let i = 0; i < bursts; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 120,
        startVelocity: 55,
        origin: { x: i % 2 === 0 ? 0.2 : 0.8, y: 0.5 },
        colors,
        scalar: 1.2,
      })
    }, i * 250)
  }
}

export function CardReveal({
  cards,
  pack,
  packType = 'normal',
  onDone,
}: {
  cards: PokemonCard[]
  pack: PackDef
  packType?: PackType
  onDone: () => void
}) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const total = cards.length
  const card = cards[index]
  const meta = TIER_META[card.tier]
  const last = index === total - 1
  const special = packType !== 'normal'

  // Kick off a big celebration the moment a special pack starts revealing.
  useEffect(() => {
    if (special) celebrateJackpot()
  }, [special])

  const handleTap = useCallback(() => {
    if (!flipped) {
      setFlipped(true)
      if (special) celebrateJackpot()
      else if (isHit(card.tier)) celebrate(card.tier)
      return
    }
    if (last) {
      onDone()
    } else {
      setIndex((i) => i + 1)
      setFlipped(false)
    }
  }, [flipped, last, card.tier, special, onDone])

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <GodPackBanner packType={packType} />
      <div className="flex w-full max-w-md items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">
          Card {index + 1} <span className="opacity-50">/ {total}</span>
        </span>
        <button
          type="button"
          onClick={onDone}
          className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Reveal all
        </button>
      </div>

      {/* Flip card */}
      <div className="flip-scene w-[280px] max-w-[78vw]">
        <button
          type="button"
          onClick={handleTap}
          aria-label={flipped ? `${card.name}, ${meta.label}` : 'Flip card'}
          className="block w-full cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div
            key={index}
            className={cn(
              'flip-inner aspect-[2.5/3.5] w-full',
              flipped && 'is-flipped',
            )}
          >
            <div className="flip-face">
              <PokeCardBack
                accentFrom={pack.accentFrom}
                accentTo={pack.accentTo}
              />
            </div>
            <div className="flip-face flip-back">
              <PokeCardFace card={card} />
            </div>
          </div>
        </button>
      </div>

      {/* Card meta */}
      <div className="flex min-h-[3.5rem] flex-col items-center gap-2 text-center">
        {flipped ? (
          <div className="animate-pop-in">
            <h3 className="font-display text-xl font-extrabold text-foreground">
              {card.name}
            </h3>
            <span
              className={cn(
                'mt-1 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                meta.badgeClass,
              )}
            >
              {card.rarity || meta.label}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Tap the card to reveal</p>
        )}
      </div>

      <Button size="lg" onClick={handleTap} className="min-w-[160px] font-semibold">
        {!flipped ? 'Reveal' : last ? 'See all pulls' : 'Next card'}
      </Button>

      {/* Filmstrip of revealed cards */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {cards.map((c, i) => {
          const revealed = i < index || (i === index && flipped)
          return (
            <div
              key={c.id + i}
              className={cn(
                'aspect-[2.5/3.5] w-8 overflow-hidden rounded-sm border transition-all',
                i === index ? 'border-primary' : 'border-border',
              )}
              style={
                revealed && isHit(c.tier)
                  ? { boxShadow: `0 0 6px ${TIER_META[c.tier].color}` }
                  : undefined
              }
            >
              {revealed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.imageSmall || '/placeholder.svg'}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background: `linear-gradient(150deg, ${pack.accentFrom}, ${pack.accentTo})`,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
