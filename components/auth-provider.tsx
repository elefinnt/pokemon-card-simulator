'use client'

import { useEffect } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import posthog from 'posthog-js'
import { SignInDialog } from '@/components/auth/sign-in-dialog'

function PostHogUserIdentifier() {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.id) {
      posthog.identify(session.user.id, {
        name: session.user.name,
      })
    }
  }, [session?.user?.id, session?.user?.name])

  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PostHogUserIdentifier />
      {children}
      <SignInDialog />
    </SessionProvider>
  )
}
