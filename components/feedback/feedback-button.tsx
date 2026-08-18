'use client'

import { MessageSquarePlus } from 'lucide-react'
import { openFeedback } from '@/lib/feedback-dialog'

/** Footer link that opens the shared feedback dialog. */
export function FeedbackButton() {
  return (
    <button
      type="button"
      onClick={() => openFeedback({ source: 'footer' })}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
    >
      <MessageSquarePlus className="size-4" />
      Send feedback
    </button>
  )
}
