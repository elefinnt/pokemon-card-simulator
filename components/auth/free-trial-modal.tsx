'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { X } from 'lucide-react'
import posthog from 'posthog-js'
import { closeFreeTrial, useFreeTrialDialog } from '@/lib/free-trial-dialog'
import { FREE_PACK_LIMIT } from '@/lib/free-packs-config'
import { cn } from '@/lib/utils'
import { Pokeball } from '@/components/poke-card'
import { SignInOptions } from './sign-in-options'

const TRUST_CHIPS = ['Always free', 'Never emails you', 'No catch'] as const

type Intent = 'sign_up' | 'sign_in'

export function FreeTrialModal() {
  const { open, source } = useFreeTrialDialog()
  const { status } = useSession()
  const [intent, setIntent] = useState<Intent>('sign_up')
  const intentRef = useRef(intent)
  intentRef.current = intent

  useEffect(() => {
    if (status === 'authenticated') closeFreeTrial()
  }, [status])

  useEffect(() => {
    if (!open) {
      setIntent('sign_up')
      return
    }
    posthog.capture('free_trial_popup_opened', { source })
  }, [open, source])

  const handleClose = useCallback(() => {
    posthog.capture('free_trial_popup_closed', {
      source,
      intent: intentRef.current,
    })
    closeFreeTrial()
  }, [source])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, handleClose])

  function chooseSignIn() {
    posthog.capture('free_trial_popup_sign_in_clicked', { source })
    setIntent('sign_in')
  }

  if (!open || status === 'authenticated') return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sign up for unlimited packs"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className={cn(
          'relative w-full max-w-md animate-pop-in rounded-3xl border border-border bg-card shadow-2xl',
          'max-h-[min(92dvh,40rem)] overflow-y-auto overscroll-contain',
          'px-5 pb-5 pt-6 sm:px-7 sm:pb-6 sm:pt-7',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{
            background:
              'radial-gradient(circle at 50% -30%, color-mix(in oklab, var(--primary) 34%, transparent), transparent 72%)',
          }}
        />

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex size-11 touch-manipulation items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-4 sm:top-4"
        >
          <X className="size-5" />
        </button>

        <div className="relative">
          <Hero />

          <div className="mt-4 text-center">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-primary">
              {FREE_PACK_LIMIT} / {FREE_PACK_LIMIT} free packs used
            </p>
            <h2 className="mt-1.5 text-balance font-display text-[1.65rem] font-black leading-tight text-foreground sm:text-3xl">
              {intent === 'sign_in'
                ? 'Welcome back'
                : 'Keep ripping — always free'}
            </h2>
            <p className="mx-auto mt-2 max-w-[20rem] text-pretty text-sm leading-relaxed text-muted-foreground">
              {intent === 'sign_in'
                ? 'Sign in to keep opening packs and pick up your collection.'
                : 'Unlimited openings and a collection that tracks every pull.'}
            </p>
          </div>

          <ul className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            {TRUST_CHIPS.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[0.7rem] font-semibold text-foreground"
              >
                {chip}
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <SignInOptions
              analyticsSource={
                intent === 'sign_up'
                  ? 'free_trial_popup_sign_up'
                  : 'free_trial_popup_sign_in'
              }
              onStart={() => {
                if (intent === 'sign_up') {
                  posthog.capture('free_trial_popup_sign_up_clicked', { source })
                }
              }}
            />
          </div>

          {intent === 'sign_up' ? (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={chooseSignIn}
                className="touch-manipulation font-semibold text-foreground underline-offset-2 hover:underline"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              New here? Same buttons create your free account.
            </p>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="mt-1 flex min-h-11 w-full touch-manipulation items-center justify-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <div className="relative mx-auto flex h-[4.75rem] w-[4.75rem] items-center justify-center sm:h-24 sm:w-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full opacity-90 blur-2xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--primary) 70%, transparent), transparent 70%)',
        }}
      />
      <Pokeball className="relative z-10 size-16 drop-shadow-lg sm:size-[4.5rem]" />
    </div>
  )
}
