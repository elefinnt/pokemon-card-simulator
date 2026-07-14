'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useSession } from 'next-auth/react'
import {
  type FriendsOverview,
  type RequestAction,
  emptyOverview,
} from './friends-types'

export type { Friend, FriendRequest, FriendsOverview } from './friends-types'

const SERVER_SNAPSHOT: FriendsOverview = Object.freeze(emptyOverview())

let cache: FriendsOverview | null = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function read(): FriendsOverview {
  return cache ?? SERVER_SNAPSHOT
}

async function fetchOverview(): Promise<FriendsOverview | null> {
  const res = await fetch('/api/friends')
  if (!res.ok) return null
  return (await res.json()) as FriendsOverview
}

/** Read an { error } message from a failed response, with a fallback. */
async function errorFrom(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null
  return body?.error ?? fallback
}

export interface ActionResult {
  ok: boolean
  error?: string
}

export function useFriends() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated' && !!session?.user

  const data = useSyncExternalStore(subscribe, read, () => SERVER_SNAPSHOT)

  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const overview = await fetchOverview()
    if (overview) {
      cache = overview
      notify()
    }
    return overview
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      cache = null
      notify()
      return
    }

    let cancelled = false
    setLoading(true)
    setLoadError(null)

    ;(async () => {
      try {
        const overview = await fetchOverview()
        if (cancelled) return
        if (overview) {
          cache = overview
          notify()
        } else {
          setLoadError('Could not load your friends.')
        }
      } catch {
        if (!cancelled) setLoadError('Could not load your friends.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const sendRequest = useCallback(
    async (code: string): Promise<ActionResult> => {
      const res = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      if (!res.ok) {
        return { ok: false, error: await errorFrom(res, 'Failed to send request') }
      }
      await refresh()
      return { ok: true }
    },
    [refresh],
  )

  const respond = useCallback(
    async (requesterId: string, action: RequestAction): Promise<ActionResult> => {
      const res = await fetch(
        `/api/friends/requests/${encodeURIComponent(requesterId)}/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        },
      )
      if (!res.ok) {
        return { ok: false, error: await errorFrom(res, 'Failed to respond') }
      }
      await refresh()
      return { ok: true }
    },
    [refresh],
  )

  const remove = useCallback(
    async (otherId: string): Promise<ActionResult> => {
      const res = await fetch(`/api/friends/${encodeURIComponent(otherId)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        return { ok: false, error: await errorFrom(res, 'Failed to remove friend') }
      }
      await refresh()
      return { ok: true }
    },
    [refresh],
  )

  return {
    data,
    loading: isAuthenticated && loading,
    loadError,
    isAuthenticated,
    refresh,
    sendRequest,
    respond,
    remove,
  }
}
