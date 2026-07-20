'use client'

import { cn } from '@/lib/utils'
import {
  floatToCondition,
  formatFloat,
  getWearTextures,
  getWearVisuals,
} from '@/lib/card-condition'

interface WornCardFaceProps {
  imageUrl: string
  alt: string
  /** 0.00–1.00 condition float */
  float: number
  /** CS-style pattern seed — same float, different wear layout */
  seed?: number
  className?: string
  showGradeBadge?: boolean
  showFloatLabel?: boolean
}

/** Card face with photographic grime/wear textures driven by a condition float. */
export function WornCardFace({
  imageUrl,
  alt,
  float,
  seed,
  className,
  showGradeBadge = true,
  showFloatLabel = false,
}: WornCardFaceProps) {
  const condition = floatToCondition(float)
  const v = getWearVisuals(float, seed)
  const textures = getWearTextures(float, seed)

  return (
    <div
      className={cn(
        'relative aspect-[2.5/3.5] w-full overflow-hidden rounded-xl bg-muted shadow-lg',
        className,
      )}
      style={{
        transform: `perspective(900px) rotateX(${v.tiltY.toFixed(
          3,
        )}deg) rotateY(${v.tiltX.toFixed(3)}deg)`,
      }}
    >
      {/* Card art with subtle colour degradation */}
      <div
        className="absolute inset-0"
        style={{ transform: `translateX(${v.offsetX.toFixed(3)}%)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            filter: `saturate(${v.saturation}) brightness(${v.brightness}) contrast(${v.contrast})`,
          }}
        />
      </div>

      {/* Warm age tint */}
      {v.yellowing > 0.04 && (
        <div
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{
            backgroundColor: `rgba(190, 160, 90, ${(v.yellowing * 0.3).toFixed(3)})`,
          }}
        />
      )}

      {/* Photographic grime / wear texture stack */}
      {textures.map((tex, i) => (
        <div
          key={`${tex.src}-${i}`}
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${tex.src})`,
            mixBlendMode: tex.blend,
            opacity: tex.opacity,
            transform: tex.transform,
          }}
        />
      ))}

      {/* Premium gloss sheen for high grades */}
      {v.gloss > 0.02 && (
        <div
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            opacity: v.gloss,
            background:
              'linear-gradient(125deg, transparent 30%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.05) 55%, transparent 70%)',
          }}
        />
      )}

      {/* Grade badge */}
      {showGradeBadge && (
        <div className="absolute right-2 top-2">
          <div
            className="rounded-md px-2 py-1 text-center shadow-md"
            style={{
              background: 'linear-gradient(180deg, #c41e3a 0%, #8b0000 100%)',
              border: '1px solid rgba(255,255,255,0.35)',
            }}
          >
            <div className="text-[0.45rem] font-bold uppercase leading-none tracking-wider text-white/90">
              PSA
            </div>
            <div className="font-display text-lg font-black leading-none text-white">
              {condition.psaGrade}
            </div>
          </div>
        </div>
      )}

      {showFloatLabel && (
        <div className="absolute bottom-2 left-2 rounded bg-black/65 px-2 py-1 font-mono text-[0.65rem] text-white/90">
          {formatFloat(float)}
        </div>
      )}
    </div>
  )
}
