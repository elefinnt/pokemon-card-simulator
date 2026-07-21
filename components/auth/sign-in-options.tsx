'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { getProviders, signIn } from 'next-auth/react'
import { Loader2, Mail, CheckCircle2 } from 'lucide-react'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { providerIcon } from './provider-icons'

type ClientProvider = {
  id: string
  name: string
  type: string
}

const isEmailProvider = (p: ClientProvider) => p.type === 'email'
const isOAuthProvider = (p: ClientProvider) =>
  p.type === 'oauth' || p.type === 'oidc'

export function SignInOptions({ onClose }: { onClose?: () => void }) {
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
  const emailProvider = providers.find(isEmailProvider)

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

      {emailProvider && oauthProviders.length > 0 && (
        <div className="my-1 flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
      )}

      {emailProvider && (
        <EmailMagicLink providerId={emailProvider.id} onSent={onClose} />
      )}
    </div>
  )
}

function EmailMagicLink({
  providerId,
  onSent,
}: {
  providerId: string
  onSent?: () => void
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || status === 'sending') return
    setStatus('sending')
    posthog.capture('signed_in', { provider: 'email' })
    try {
      const res = await signIn(providerId, { email, redirect: false })
      if (res && 'error' in res && res.error) {
        setStatus('error')
        return
      }
      setStatus('sent')
      // Give the user a moment to read the confirmation before closing.
      setTimeout(() => onSent?.(), 2500)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-5 text-center">
        <CheckCircle2 className="size-6 text-primary" />
        <p className="text-sm font-semibold text-foreground">
          Check your inbox
        </p>
        <p className="text-xs text-muted-foreground">
          We sent a sign-in link to {email}. It expires in 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label htmlFor="signin-email" className="sr-only">
        Email address
      </label>
      <Input
        id="signin-email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (status === 'error') setStatus('idle')
        }}
        className="h-11"
      />
      <Button
        type="submit"
        size="lg"
        disabled={status === 'sending'}
        className="w-full justify-center gap-2 font-semibold"
      >
        {status === 'sending' ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Mail className="size-4" />
        )}
        Email me a sign-in link
      </Button>
      {status === 'error' && (
        <p className="text-center text-xs text-destructive">
          Could not send the link. Check the address and try again.
        </p>
      )}
    </form>
  )
}
