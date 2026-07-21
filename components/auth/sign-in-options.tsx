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

export function SignInOptions() {
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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const oauthProviders = providers.filter(isOAuthProvider)

  const startOAuth = (provider: ClientProvider) => {
    posthog.capture('signed_in', { provider: provider.id })
    const callbackUrl =
      typeof window !== 'undefined' ? window.location.href : '/'
    void signIn(provider.id, { callbackUrl })
  }

  return (
    <div className="flex flex-col gap-3">
      {oauthProviders.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          size="lg"
          onClick={() => startOAuth(provider)}
          className="w-full justify-center gap-2.5 font-semibold"
        >
          {providerIcon(provider.id, 'size-4')}
          Continue with {provider.name}
        </Button>
      ))}
    </div>
  )
}
