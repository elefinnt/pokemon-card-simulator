'use client'

import { PackagePlus } from 'lucide-react'
import { openFeedback } from '@/lib/feedback-dialog'
import { Button } from '@/components/ui/button'

/** Quiet CTA under the pack catalogue for requesting a set we do not have. */
export function RequestPackCta() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-5 py-6 text-center">
      <p className="font-display text-base font-extrabold text-foreground">
        Can&apos;t find a set?
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        Request a pack and I will look at adding it — vintage, Japanese, or the
        latest drop. Other ideas and bug reports are welcome too.
      </p>
      <Button
        type="button"
        variant="outline"
        className="font-semibold"
        onClick={() =>
          openFeedback({ category: 'pack', source: 'pack_browser' })
        }
      >
        <PackagePlus className="size-4" />
        Request a pack
      </Button>
    </div>
  )
}
