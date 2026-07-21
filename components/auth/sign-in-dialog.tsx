'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { closeSignIn, useSignInDialogOpen } from '@/lib/sign-in-dialog'
import { SignInOptions } from './sign-in-options'

export function SignInDialog() {
  const open = useSignInDialogOpen()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSignIn()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={closeSignIn}
    >
      <div
        className="relative w-full max-w-sm animate-pop-in rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeSignIn}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5 text-center">
          <h2 className="font-display text-xl font-extrabold text-foreground">
            Sign in to PackRip
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open unlimited packs and save your collection across devices.
          </p>
        </div>

        <SignInOptions onClose={closeSignIn} />

        <p className="mt-5 text-center text-[0.7rem] leading-relaxed text-muted-foreground">
          It&apos;s free — no credit card, no spam.
        </p>
      </div>
    </div>
  )
}
