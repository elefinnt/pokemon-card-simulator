'use client'

import { useCallback, useRef, useState } from 'react'
import type { CardTier } from '@/lib/pokemon'
import { TIER_META } from '@/lib/rarity'
import { cn } from '@/lib/utils'

const MAX_TILT = 18

/** Minimal card shape needed to render an interactive tilting preview. */
export interface TiltCardData {
  name: string
  rarity: string
  tier: CardTier
  foil: boolean
  rainbow: boolean
  imageSmall: string
  imageLarge: string
}

/**
 * A large card that tilts in 3D toward the pointer with a moving glare, plus
 * the holo/rainbow overlays. Shared by the collection and pack-summary
 * previews so both feel identical.
 */
export function TiltCard({
  card,
  className,
}: {
  card: TiltCardData
  className?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const [interacting, setInteracting] = useState(false)
  const meta = TIER_META[card.tier]

  const resetTilt = useCallback(() => {
    const el = cardRef.current
    if (el) el.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)'
    if (glareRef.current) glareRef.current.style.opacity = '0'
  }, [])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (clientX - rect.left) / rect.width
    const py = (clientY - rect.top) / rect.height
    const rotateY = (px - 0.5) * 2 * MAX_TILT
    const rotateX = -(py - 0.5) * 2 * MAX_TILT
    el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`
    if (glareRef.current) {
      glareRef.current.style.opacity = '1'
      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.45), rgba(255,255,255,0) 55%)`
    }
  }, [])

  return (
    <div
      className={cn('w-full select-none', className)}
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
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {card.rainbow && (
          <div className="holo-rainbow pointer-events-none absolute inset-0 rounded-2xl" />
        )}
        {card.foil && (
          <div className="holo-shine pointer-events-none absolute inset-0" />
        )}
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 mix-blend-overlay"
        />
      </div>
    </div>
  )
}
