'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { GuideExampleCard } from '@/lib/guides'
import { TIER_META } from '@/lib/rarity'
import { TiltCard } from '@/components/tilt-card'

/** Card images are vendored in `public/cards` so guide pages never depend on
 *  the Pokémon TCG image CDN. See `scripts/convert-guide-cards.mjs`. */
function cardImage(cardId: string, hires = false): string {
  return `/cards/${cardId}${hires ? '_hires' : ''}.webp`
}

export function GuideCardExamples({ cards }: { cards: GuideExampleCard[] }) {
  const [zoomed, setZoomed] = useState<GuideExampleCard | null>(null)

  return (
    <>
      <ul className="flex flex-wrap gap-x-5 gap-y-6 pt-3">
        {cards.map((card) => {
          const meta = TIER_META[card.tier]
          return (
            <li key={card.id} className="w-36 sm:w-44">
              <button
                type="button"
                onClick={() => setZoomed(card)}
                aria-label={`Enlarge ${card.name}`}
                className="group block w-full cursor-zoom-in text-left"
                style={{ '--glow': meta.color } as React.CSSProperties}
              >
                <img
                  src={cardImage(card.id)}
                  alt={`${card.name} — ${card.set}`}
                  loading="lazy"
                  draggable={false}
                  className="w-full rounded-xl shadow-[0_6px_20px_-8px_rgba(0,0,0,0.7)] ring-1 ring-white/10 transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.03] group-hover:shadow-[0_0_0_1px_var(--glow),0_18px_40px_-12px_var(--glow)]"
                />
                <span className="mt-2.5 block text-xs leading-snug">
                  <span className="font-semibold text-foreground">
                    {card.name}
                  </span>
                  <span
                    className="mx-1.5 inline-block size-1 -translate-y-0.5 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  {card.set}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {zoomed && (
        <GuideCardZoom card={zoomed} onClose={() => setZoomed(null)} />
      )}
    </>
  )
}

function GuideCardZoom({
  card,
  onClose,
}: {
  card: GuideExampleCard
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/85 p-4 py-8 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${card.name} card detail`}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-5" />
      </button>

      <div
        className="flex w-full max-w-sm flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <TiltCard
          card={{
            name: card.name,
            rarity: card.set,
            tier: card.tier,
            foil: card.foil ?? false,
            rainbow: false,
            imageSmall: cardImage(card.id),
            imageLarge: cardImage(card.id, true),
          }}
        />
        <p className="text-center text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{card.name}</span>
          <br />
          {card.set}
        </p>
      </div>
    </div>
  )
}
