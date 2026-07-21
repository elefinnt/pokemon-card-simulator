'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { fetchPublicProfile } from '@/lib/profile'
import type { PublicProfile } from '@/lib/profile-types'
import { SignInPrompt } from '@/components/sign-in-prompt'
import { ProfileCard } from './profile-card'
import { ProfileEditor } from './profile-editor'

export function ProfilePageContent() {
  const { data: session, status } = useSession()
  const userId = session?.user?.id
  const [preview, setPreview] = useState<PublicProfile | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(true)

  const loadPreview = useCallback(async () => {
    if (!userId) return
    const profile = await fetchPublicProfile(userId)
    if (profile) setPreview(profile)
    setLoadingPreview(false)
  }, [userId])

  useEffect(() => {
    if (status === 'authenticated') {
      setLoadingPreview(true)
      loadPreview()
    }
  }, [status, loadPreview])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (status !== 'authenticated') {
    return (
      <SignInPrompt
        title="Sign in to set up your profile"
        description="Sign in to choose a display name, write a bio and pick your showcase cards."
        className="mt-10"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to packs
        </Link>
        <h1 className="mt-3 font-display text-3xl font-black text-foreground">
          Your profile
        </h1>
        <p className="mt-1 text-muted-foreground">
          Personalise how other collectors see you.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
        <aside className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Preview
          </p>
          {loadingPreview && !preview ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : preview ? (
            <ProfileCard profile={preview} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Save your profile to see a preview.
            </p>
          )}
        </aside>

        <ProfileEditor onSaved={loadPreview} />
      </div>
    </div>
  )
}
