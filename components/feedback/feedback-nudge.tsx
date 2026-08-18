'use client'

import { useEffect } from 'react'
import { MessageSquarePlus, X } from 'lucide-react'
import posthog from 'posthog-js'
import { openFeedback } from '@/lib/feedback-dialog'
import {
  dismissFeedbackNudge,
  hideFeedbackNudge,
  useFeedbackNudgeOpen,
} from '@/lib/feedback-prompt'
import { useFreeTrialDialog } from '@/lib/free-trial-dialog'
import { useSignInDialogOpen } from '@/lib/sign-in-dialog'
import { Button } from '@/components/ui/button'

/**
 * Small, dismissible card that appears after a couple of pack opens.
 * Never blocks the page — the dialog is opt-in from here.
 */
export function FeedbackNudge() {
  const open = useFeedbackNudgeOpen()
  const { open: freeTrialOpen } = useFreeTrialDialog()
  const signInOpen = useSignInDialogOpen()
  const visible = open && !freeTrialOpen && !signInOpen

  useEffect(() => {
    if (freeTrialOpen) hideFeedbackNudge()
  }, [freeTrialOpen])

  useEffect(() => {
    if (!visible) return
    posthog.capture('feedback_nudge_shown')
  }, [visible])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Feedback prompt"
      className="fixed z-40 w-[min(22rem,calc(100vw-2rem))] animate-pop-in rounded-2xl border border-border bg-card p-4 shadow-2xl"
      style={{
        right: 'max(1rem, env(safe-area-inset-right))',
        bottom: 'max(4.75rem, calc(env(safe-area-inset-bottom) + 3.75rem))',
      }}
    >
      <button
        type="button"
        onClick={() => {
          posthog.capture('feedback_nudge_dismissed')
          dismissFeedbackNudge()
        }}
        aria-label="Dismiss"
        className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-start gap-3 pr-7">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MessageSquarePlus className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-extrabold text-foreground">
            Missing a pack? Got an idea?
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Request a set we do not have, report a bug, or tell me what would
            make PackRip better. Takes about 20 seconds.
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            posthog.capture('feedback_nudge_dismissed')
            dismissFeedbackNudge()
          }}
        >
          Not now
        </Button>
        <Button
          type="button"
          size="sm"
          className="font-semibold"
          onClick={() => {
            posthog.capture('feedback_nudge_clicked')
            openFeedback({ category: 'pack', source: 'nudge' })
          }}
        >
          Send feedback
        </Button>
      </div>
    </div>
  )
}
