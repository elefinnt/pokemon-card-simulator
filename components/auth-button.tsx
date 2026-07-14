'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { LogIn, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="size-4 animate-spin" />
      </Button>
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="size-7 rounded-full border border-border"
          />
        )}
        <span className="hidden text-sm font-medium text-foreground sm:inline">
          {session.user.name}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
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
      onClick={() => signIn('discord')}
      className="text-muted-foreground"
    >
      <LogIn className="size-4" />
      Sign in with Discord
    </Button>
  )
}
