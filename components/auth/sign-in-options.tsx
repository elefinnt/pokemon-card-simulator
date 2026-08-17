'use client'

import { useEffect, useState } from 'react'
import { getProviders, signIn } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button'
import { providerIcon } from './provider-icons'

type ClientProvider = {
  id: string
  name: string
  type: string
}

const isOAuthProvider = (p: ClientProvider) =>
  p.type === 'oauth' || p.type === 'oidc'

export function SignInOptions({
  analyticsSource,
  onStart,
}: {
  /** Optional PostHog `source` on the existing `signed_in` event. */
  analyticsSource?: string
  /** Fired when the visitor picks a provider, before redirect. */
  onStart?: (providerId: string) => void
} = {}) {
  const [providers, setProviders] = useState<ClientProvider[] | null>(null)

  useEffect(() => {
    let cancelled = false
    getProviders()
      .then((res) => {
        if (cancelled) return
        setProviders(res ? Object.values(res) : [])
      })
      .catch(() => {
        if (!cancelled) setProviders([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (providers === null) {
    return (
      <div className="flex items-center justify-center py-5">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const oauthProviders = providers.filter(isOAuthProvider)

  const startOAuth = (provider: ClientProvider) => {
    onStart?.(provider.id)
    posthog.capture('signed_in', {
      provider: provider.id,
      ...(analyticsSource ? { source: analyticsSource } : {}),
    })
    const callbackUrl =
      typeof window !== 'undefined' ? window.location.href : '/'
    void signIn(provider.id, { callbackUrl })
  }

  return (
    <div className="flex flex-col gap-2.5">
      {oauthProviders.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          onClick={() => startOAuth(provider)}
          className="h-12 w-full touch-manipulation justify-center gap-2.5 rounded-xl text-base font-semibold"
        >
          {providerIcon(provider.id, 'size-5')}
          Continue with {provider.name}
        </Button>
      ))}
    </div>
  )
}
