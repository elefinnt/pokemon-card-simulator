'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useSession } from 'next-auth/react'
import type { CollectionData } from './collection-types'
import {
  type CreateTradeInput,
  type TradeOffer,
  type TradeOverview,
  type TradeResponseAction,
  emptyTradeOverview,
} from './trades-types'

export type {
  TradeOffer,
  TradeOverview,
  TradeItem,
  TradeParty,
  TradeResponseAction,
} from './trades-types'

const SERVER_SNAPSHOT: TradeOverview = Object.freeze(emptyTradeOverview())

let cache: TradeOverview | null = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function read(): TradeOverview {
  return cache ?? SERVER_SNAPSHOT
}

async function fetchOverview(): Promise<TradeOverview | null> {
  const res = await fetch('/api/trades')
  if (!res.ok) return null
  return (await res.json()) as TradeOverview
}

async function errorFrom(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null
  return body?.error ?? fallback
}

export interface TradeActionResult {
  ok: boolean
  error?: string
  id?: number
}

export function useTrades() {
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
          setLoadError('Could not load your trades.')
        }
      } catch {
        if (!cancelled) setLoadError('Could not load your trades.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const createOffer = useCallback(
    async (input: CreateTradeInput): Promise<TradeActionResult> => {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        return { ok: false, error: await errorFrom(res, 'Failed to send offer') }
      }
      const body = (await res.json()) as { id?: number }
      await refresh()
      return { ok: true, id: body.id }
    },
    [refresh],
  )

  const respond = useCallback(
    async (
      offerId: number,
      action: TradeResponseAction,
    ): Promise<TradeActionResult> => {
      const res = await fetch(`/api/trades/${offerId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        return { ok: false, error: await errorFrom(res, 'Failed to respond') }
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
    createOffer,
    respond,
  }
}

/** Load a friend's collection for the trade builder (friendship gated). */
export async function fetchFriendCollection(
  friendId: string,
): Promise<CollectionData | null> {
  const res = await fetch(`/api/friends/${encodeURIComponent(friendId)}/collection`)
  if (!res.ok) return null
  return (await res.json()) as CollectionData
}
