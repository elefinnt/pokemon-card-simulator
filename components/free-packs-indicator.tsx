'use client'

import { Gift, Sparkles } from 'lucide-react'
import type { FreePackState } from '@/lib/free-packs'

/**
 * Small status pill shown to signed-out visitors on the sealed-pack screen.
 * Counts down their free opens and teases the boosted final pack.
 */
export function FreePacksIndicator({ state }: { state: FreePackState }) {
  if (state.isLastFree) {
    return (
      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
          <Sparkles className="size-3.5" />
          Last free pack · boosted pull rate
        </span>
        <p className="text-xs text-muted-foreground">
          Sign in afterwards to save whatever you hit.
        </p>
      </div>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
      <Gift className="size-3.5 text-primary" />
      {state.remaining} free {state.remaining === 1 ? 'pack' : 'packs'} left
    </span>
  )
}
