import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PACK_TYPE_META, type PackType } from '@/lib/god-pack'

/** Celebratory banner shown for demigod / god packs. Renders nothing otherwise. */
export function GodPackBanner({
  packType,
  className,
}: {
  packType: PackType
  className?: string
}) {
  if (packType === 'normal') return null
  const meta = PACK_TYPE_META[packType]

  return (
    <div
      className={cn(
        'relative w-full max-w-md overflow-hidden rounded-2xl p-[2px]',
        packType === 'god' && 'animate-pulse',
        className,
      )}
      style={{ background: meta.gradient }}
    >
      <div className="rounded-2xl bg-card/90 px-4 py-3 text-center backdrop-blur">
        <p
          className="flex items-center justify-center gap-2 font-display text-lg font-black tracking-widest"
          style={{
            background: meta.gradient,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          <Sparkles className="size-5 text-primary" aria-hidden="true" />
          {meta.label}
          <Sparkles className="size-5 text-primary" aria-hidden="true" />
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{meta.tagline}</p>
      </div>
    </div>
  )
}
