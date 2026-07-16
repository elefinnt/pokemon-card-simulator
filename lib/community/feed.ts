'use client'

import { useCallback, useEffect, useState } from 'react'
import { MOCK_FEED_EVENTS } from './mock-feed'
import { type FeedEvent, type ReactionKey } from './types'

export type { FeedEvent, ReactionKey } from './types'

/** Apply a reaction toggle to a feed locally, mirroring the server logic. */
function applyReaction(
  events: FeedEvent[],
  openingId: number,
  key: ReactionKey,
): FeedEvent[] {
  return events.map((event) => {
    if (event.id !== openingId) return event
    const reactions = { ...event.reactions }
    const current = event.myReaction

    if (current === key) {
      reactions[key] = Math.max(0, reactions[key] - 1)
      return { ...event, reactions, myReaction: null }
    }

    if (current) reactions[current] = Math.max(0, reactions[current] - 1)
    reactions[key] += 1
    return { ...event, reactions, myReaction: key }
  })
}

export function useCommunityFeed(isAuthenticated: boolean) {
  const [events, setEvents] = useState<FeedEvent[]>(() =>
    isAuthenticated ? [] : MOCK_FEED_EVENTS,
  )
  const [loading, setLoading] = useState(isAuthenticated)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/community')
      if (!res.ok) {
        setError('Could not load the community feed.')
        return
      }
      const data = (await res.json()) as { events: FeedEvent[] }
      setEvents(data.events)
      setError(null)
    } catch {
      setError('Could not load the community feed.')
    }
  }, [])

  useEffect(() => {
    // Signed-out visitors see a static, mocked preview — no network needed.
    if (!isAuthenticated) {
      setEvents(MOCK_FEED_EVENTS)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    refresh().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
    // Re-fetch when auth changes so the viewer's own reactions load.
  }, [isAuthenticated, refresh])

  const react = useCallback(
    async (openingId: number, key: ReactionKey) => {
      if (!isAuthenticated) return

      setEvents((prev) => applyReaction(prev, openingId, key))

      try {
        const res = await fetch(`/api/community/${openingId}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reaction: key }),
        })
        if (!res.ok) await refresh()
      } catch {
        await refresh()
      }
    },
    [isAuthenticated, refresh],
  )

  return { events, loading, error, react, refresh }
}
