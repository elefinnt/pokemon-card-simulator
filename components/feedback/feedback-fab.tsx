'use client'

import { MessageSquarePlus } from 'lucide-react'
import posthog from 'posthog-js'
import { openFeedback, useFeedbackDialog } from '@/lib/feedback-dialog'

/** Always-visible corner button so feedback is one tap away on any page. */
export function FeedbackFab() {
  const { open } = useFeedbackDialog()
  if (open) return null

  return (
    <button
      type="button"
      onClick={() => {
        posthog.capture('feedback_fab_clicked')
        openFeedback({ source: 'fab' })
      }}
      aria-label="Send feedback"
      className="fixed z-40 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        right: 'max(1rem, env(safe-area-inset-right))',
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <MessageSquarePlus className="size-4 text-primary" />
      Feedback
    </button>
  )
}
