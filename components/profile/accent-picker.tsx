'use client'

import { Check } from 'lucide-react'
import { ACCENTS } from '@/lib/profile-types'
import { cn } from '@/lib/utils'

export function AccentPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ACCENTS.map((accent) => {
        const active = accent.id === value
        return (
          <button
            key={accent.id}
            type="button"
            onClick={() => onChange(accent.id)}
            aria-pressed={active}
            aria-label={accent.label}
            title={accent.label}
            className={cn(
              'flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110',
              active && 'ring-2 ring-offset-2 ring-offset-card',
            )}
            style={{
              backgroundColor: accent.color,
              // Tailwind can't see the dynamic colour, so set the ring here.
              ...(active ? { boxShadow: `0 0 0 2px ${accent.color}` } : {}),
            }}
          >
            {active && <Check className="size-4 text-white drop-shadow" />}
          </button>
        )
      })}
    </div>
  )
}
