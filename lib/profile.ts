'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useSession } from 'next-auth/react'
import {
  type MyProfile,
  type PublicProfile,
  DEFAULT_ACCENT,
} from './profile-types'

export type { MyProfile, PublicProfile, ShowcaseCard } from './profile-types'

const EMPTY_PROFILE: MyProfile = Object.freeze({
  displayName: null,
  bio: null,
  accent: DEFAULT_ACCENT,
  showcase: [],
})

// Module-level cache so every consumer of the hook shares one profile.
let cache: MyProfile | null = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function read(): MyProfile {
  return cache ?? EMPTY_PROFILE
}

async function fetchMyProfile(): Promise<MyProfile | null> {
  const res = await fetch('/api/profile')
  if (!res.ok) return null
  return (await res.json()) as MyProfile
}

async function errorFrom(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null
  return body?.error ?? fallback
}

export interface ProfileActionResult {
  ok: boolean
  error?: string
}

export function useProfile() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated' && !!session?.user

  const data = useSyncExternalStore(subscribe, read, () => EMPTY_PROFILE)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    const profile = await fetchMyProfile()
    if (profile) {
      cache = profile
      notify()
    }
    return profile
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      cache = null
      notify()
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const profile = await fetchMyProfile()
        if (!cancelled && profile) {
          cache = profile
          notify()
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const saveDetails = useCallback(
    async (input: {
      displayName: string | null
      bio: string | null
      accent: string
    }): Promise<ProfileActionResult> => {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        return { ok: false, error: await errorFrom(res, 'Failed to save profile') }
      }
      cache = (await res.json()) as MyProfile
      notify()
      return { ok: true }
    },
    [],
  )

  const saveShowcase = useCallback(
    async (cardIds: string[]): Promise<ProfileActionResult> => {
      const res = await fetch('/api/profile/showcase', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds }),
      })
      if (!res.ok) {
        return { ok: false, error: await errorFrom(res, 'Failed to save showcase') }
      }
      cache = (await res.json()) as MyProfile
      notify()
      return { ok: true }
    },
    [],
  )

  return {
    data,
    loading: isAuthenticated && loading,
    isAuthenticated,
    refresh,
    saveDetails,
    saveShowcase,
  }
}

/** Fetch another player's public profile (friend-gated server-side). */
export async function fetchPublicProfile(
  userId: string,
): Promise<PublicProfile | null> {
  const res = await fetch(`/api/users/${encodeURIComponent(userId)}/profile`)
  if (!res.ok) return null
  return (await res.json()) as PublicProfile
}
