'use client'

import { LogIn, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { openSignIn } from '@/lib/sign-in-dialog'

export function SignInPrompt({
  variant = 'card',
  title = 'Sign in to start ripping',
  description = 'Sign in free with Google, Discord or email to open unlimited packs and build a collection that saves across devices.',
  className,
}: {
  variant?: 'banner' | 'card' | 'compact'
  title?: string
  description?: string
  className?: string
}) {
  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 px-6 py-5 text-center sm:flex-row sm:text-left',
          className,
        )}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <Lock className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-extrabold text-foreground">
            {title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={openSignIn} className="shrink-0 font-semibold">
          <LogIn className="size-4" />
          Sign in
        </Button>
      </div>
    )
  }
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col items-center gap-3 text-center', className)}>
        <p className="text-sm font-medium text-muted-foreground">{description}</p>
        <Button onClick={openSignIn} size="lg" className="font-semibold">
          <LogIn className="size-4" />
          Sign in
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'mx-auto max-w-md rounded-2xl border border-border bg-card px-6 py-10 text-center',
        className,
      )}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15">
        <Lock className="size-6 text-primary" />
      </div>
      <h3 className="mt-4 font-display text-xl font-extrabold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Button onClick={openSignIn} size="lg" className="mt-6 font-semibold">
        <LogIn className="size-4" />
        Sign in
      </Button>
    </div>
  )
}
