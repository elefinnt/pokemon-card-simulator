'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { LogIn, LogOut, Loader2 } from 'lucide-react'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { useProfile } from '@/lib/profile'
import { accentColor, resolveDisplayName } from '@/lib/profile-types'
import { openSignIn } from '@/lib/sign-in-dialog'

export function AuthButton() {
  const { data: session, status } = useSession()
  const { data: profile } = useProfile()

  if (status === 'loading') {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="size-4 animate-spin" />
      </Button>
    )
  }

  if (session?.user) {
    const name = resolveDisplayName(profile.displayName, session.user.name)

    return (
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open your profile"
          title="Your profile"
        >
          <UserAvatar
            name={name}
            image={session.user.image}
            accent={accentColor(profile.accent)}
          />
          <span className="hidden max-w-32 truncate text-sm font-medium text-foreground sm:inline">
            {name}
          </span>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            posthog.capture('signed_out')
            posthog.reset()
            signOut()
          }}
          className="text-muted-foreground"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={openSignIn}
      className="text-muted-foreground"
    >
      <LogIn className="size-4" />
      Sign in
    </Button>
  )
}
