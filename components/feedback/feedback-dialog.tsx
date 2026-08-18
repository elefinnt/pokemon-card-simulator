'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Check, Loader2 } from 'lucide-react'
import posthog from 'posthog-js'
import {
  type FeedbackCategory,
  FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_HINTS,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_CATEGORY_PLACEHOLDERS,
  FEEDBACK_EMAIL_MAX_LENGTH,
  FEEDBACK_MESSAGE_MAX_LENGTH,
  FEEDBACK_MESSAGE_MIN_LENGTH,
  isValidFeedbackEmail,
} from '@/lib/feedback-types'
import {
  type FeedbackSource,
  closeFeedback,
  useFeedbackDialog,
} from '@/lib/feedback-dialog'
import { recordFeedbackSubmitted } from '@/lib/feedback-prompt'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModalShell } from '@/components/modal-shell'

export function FeedbackDialogHost() {
  const { open, category, source } = useFeedbackDialog()
  if (!open) return null
  return (
    <FeedbackDialog
      key={`${source}-${category}`}
      initialCategory={category}
      source={source}
    />
  )
}

function FeedbackDialog({
  initialCategory,
  source,
}: {
  initialCategory: FeedbackCategory
  source: FeedbackSource
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const accountEmail = session?.user?.email ?? null
  const [category, setCategory] = useState<FeedbackCategory>(initialCategory)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [contactOk, setContactOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    posthog.capture('feedback_opened', { source, category: initialCategory })
  }, [source, initialCategory])

  const emailOk =
    !contactOk || accountEmail !== null || isValidFeedbackEmail(email)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message,
          contactOk,
          email: contactOk ? (accountEmail ?? email) : null,
          page: pathname,
        }),
      })
      const data = (await res.json().catch(() => null)) as {
        error?: string
      } | null

      if (!res.ok) {
        setError(data?.error ?? 'Could not send your feedback.')
        return
      }

      posthog.capture('feedback_submitted', {
        category,
        source,
        contact_ok: contactOk,
      })
      recordFeedbackSubmitted()
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
      subtitle="Request a missing pack, report a bug, or share an idea. I read every message."
      onClose={closeFeedback}
      maxWidthClassName="max-w-md"
    >
      {sent ? (
        <Thanks contactOk={contactOk} />
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              What is this about?
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
            <p className="mt-2 text-sm text-muted-foreground">
              {FEEDBACK_CATEGORY_HINTS[category]}
            </p>
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
              placeholder={FEEDBACK_CATEGORY_PLACEHOLDERS[category]}
              className="mt-2 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {message.length}/{FEEDBACK_MESSAGE_MAX_LENGTH}
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-background/60 px-3 py-3">
            <input
              type="checkbox"
              checked={contactOk}
              onChange={(e) => setContactOk(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                I&apos;m happy for you to get in touch about this
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                For example if I add your pack or ship the feature. Never shared
                or used for anything else.
              </span>
            </span>
          </label>

          {contactOk &&
            (accountEmail ? (
              <p className="text-xs text-muted-foreground">
                I&apos;ll use{' '}
                <span className="font-medium text-foreground">
                  {accountEmail}
                </span>
                .
              </p>
            ) : (
              <div>
                <label
                  htmlFor="feedback-email"
                  className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Your email
                </label>
                <Input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={FEEDBACK_EMAIL_MAX_LENGTH}
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="mt-2 h-10"
                />
              </div>
            ))}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                busy ||
                message.trim().length < FEEDBACK_MESSAGE_MIN_LENGTH ||
                !emailOk
              }
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

function Thanks({ contactOk }: { contactOk: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Check className="size-6" />
      </span>
      <p className="font-display text-lg font-extrabold text-foreground">
        Thanks for the feedback!
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        {contactOk
          ? 'I read every message. If I add the pack or ship the idea, I will let you know.'
          : 'Every message gets read and helps make PackRip better.'}
      </p>
      <Button onClick={closeFeedback} className="mt-2 font-semibold">
        Done
      </Button>
    </div>
  )
}
