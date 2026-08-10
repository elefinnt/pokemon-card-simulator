'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import posthog from 'posthog-js'
import {
  type FeedbackCategory,
  FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_MESSAGE_MAX_LENGTH,
} from '@/lib/feedback-types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ModalShell } from '@/components/modal-shell'

export function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  const [category, setCategory] = useState<FeedbackCategory>('idea')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message, page: pathname }),
      })
      const data = (await res.json().catch(() => null)) as {
        error?: string
      } | null

      if (!res.ok) {
        setError(data?.error ?? 'Could not send your feedback.')
        return
      }

      posthog.capture('feedback_submitted', { category })
      setSent(true)
    } catch {
      setError('Could not send your feedback.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ModalShell
      title="Send feedback"
      subtitle="Spotted a bug or got an idea? We read everything."
      onClose={onClose}
      maxWidthClassName="max-w-md"
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="size-6" />
          </span>
          <p className="font-display text-lg font-extrabold text-foreground">
            Thanks for the feedback!
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Every message gets read and helps make PackRip better.
          </p>
          <Button onClick={onClose} className="mt-2 font-semibold">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              What kind of feedback?
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {FEEDBACK_CATEGORIES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    category === option
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground',
                  )}
                >
                  {FEEDBACK_CATEGORY_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="feedback-message"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Your feedback
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={FEEDBACK_MESSAGE_MAX_LENGTH}
              rows={5}
              required
              placeholder="Tell us what's on your mind…"
              className="mt-2 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {message.length}/{FEEDBACK_MESSAGE_MAX_LENGTH}
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={busy || message.trim().length === 0}
              className="font-semibold"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              Send feedback
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  )
}
