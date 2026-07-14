'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, RotateCcw } from 'lucide-react'
import type { CollectedCard } from '@/lib/collection'
import { TIER_META } from '@/lib/rarity'
import { cn } from '@/lib/utils'

const MAX_TILT = 18 // degrees

export function CardDetailModal({
  card,
  onClose,
}: {
  card: CollectedCard | null
  onClose: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const [interacting, setInteracting] = useState(false)

  // Reset transform helper.
  const resetTilt = useCallback(() => {
    const el = cardRef.current
    if (el) {
      el.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)'
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0'
    }
  }, [])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (clientX - rect.left) / rect.width // 0..1
    const py = (clientY - rect.top) / rect.height // 0..1
    const rotateY = (px - 0.5) * 2 * MAX_TILT
    const rotateX = -(py - 0.5) * 2 * MAX_TILT
    el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`
    if (glareRef.current) {
      glareRef.current.style.opacity = '1'
      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.45), rgba(255,255,255,0) 55%)`
    }
  }, [])

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!card) return
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
  }, [card, onClose])

  if (!card) return null

  const meta = TIER_META[card.tier]

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
        className="flex w-full max-w-sm flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tilt stage */}
        <div
          className="w-full select-none"
          style={{ perspective: '1200px' }}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseEnter={() => setInteracting(true)}
          onMouseLeave={() => {
            setInteracting(false)
            resetTilt()
          }}
          onTouchStart={() => setInteracting(true)}
          onTouchMove={(e) => {
            const t = e.touches[0]
            if (t) handleMove(t.clientX, t.clientY)
          }}
          onTouchEnd={() => {
            setInteracting(false)
            resetTilt()
          }}
        >
          <div
            ref={cardRef}
            className={cn(
              'relative aspect-[2.5/3.5] w-full overflow-hidden rounded-2xl bg-muted',
              !interacting && 'transition-transform duration-500 ease-out',
            )}
            style={{
              transformStyle: 'preserve-3d',
              boxShadow: `0 0 0 1px ${meta.color}66, 0 30px 60px -20px ${meta.color}88, 0 20px 50px -25px rgba(0,0,0,0.9)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.imageLarge || card.imageSmall || '/placeholder.svg'}
              alt={`${card.name} — ${card.rarity}`}
              crossOrigin="anonymous"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />

            {/* Holo / rainbow foil overlays reused from globals */}
            {card.rainbow && (
              <div className="holo-rainbow pointer-events-none absolute inset-0 rounded-2xl" />
            )}
            {card.foil && (
              <div className="holo-shine pointer-events-none absolute inset-0" />
            )}

            {/* Mouse-following glare */}
            <div
              ref={glareRef}
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 mix-blend-overlay"
            />
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 w-full rounded-xl border border-border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 className="font-display text-xl font-black text-foreground">
              {card.name}
            </h3>
            {card.count > 1 && (
              <span
                className="rounded-md px-1.5 py-0.5 text-xs font-black text-black"
                style={{ backgroundColor: meta.color }}
              >
                &times;{card.count}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm">
            <span
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-xs font-bold',
                meta.badgeClass,
              )}
            >
              {card.rarity || meta.label}
            </span>
            <span className="text-muted-foreground">No. {card.number}</span>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <RotateCcw className="size-3.5" />
            Move your cursor over the card to tilt it
          </p>
        </div>
      </div>
    </div>
  )
}
