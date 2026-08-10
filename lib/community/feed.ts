'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PackDef } from '@/lib/packs'
import { getGlobalFeedEvents, setCachedGlobalEvents } from './global-feed'
import { type FeedEvent, type ReactionKey } from './types'

export type { FeedEvent, ReactionKey } from './types'

export type FeedScope = 'friends' | 'global'

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

/**
 * Community feed state for both scopes.
 *
 * - `friends`: real openings from the viewer and their accepted friends.
 * - `global`: the viewer's real feed blended with generated mock activity,
 *   emulating a worldwide feed until the player base can fill one for real.
 */
export function useCommunityFeed(
  isAuthenticated: boolean,
  scope: FeedScope,
  packs: PackDef[],
) {
  const [real, setReal] = useState<FeedEvent[]>([])
  const [mock, setMock] = useState<FeedEvent[]>([])
  const [loadingReal, setLoadingReal] = useState(isAuthenticated)
  const [loadingMock, setLoadingMock] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/community')
      if (!res.ok) {
        setError('Could not load the community feed.')
        return
      }
      const data = (await res.json()) as { events: FeedEvent[] }
      setReal(data.events)
      setError(null)
    } catch {
      setError('Could not load the community feed.')
    }
  }, [])

  // Real events power both scopes; only signed-in viewers have any.
  useEffect(() => {
    if (!isAuthenticated) {
      setReal([])
      setError(null)
      setLoadingReal(false)
      return
    }

    let cancelled = false
    setLoadingReal(true)
    refresh().finally(() => {
      if (!cancelled) setLoadingReal(false)
    })
    return () => {
      cancelled = true
    }
    // Re-fetch when auth changes so the viewer's own reactions load.
  }, [isAuthenticated, refresh])

  // Generate the mock global activity the first time the scope is opened.
  useEffect(() => {
    if (scope !== 'global' || mock.length > 0 || packs.length === 0) return

    let cancelled = false
    setLoadingMock(true)
    getGlobalFeedEvents(packs)
      .then((events) => {
        if (!cancelled) setMock(events)
      })
      .finally(() => {
        if (!cancelled) setLoadingMock(false)
      })
    return () => {
      cancelled = true
    }
  }, [scope, mock.length, packs])

  const events = useMemo(() => {
    if (scope === 'friends') return real
    return [...mock, ...real].sort((a, b) => a.minutesAgo - b.minutesAgo)
  }, [scope, real, mock])

  const react = useCallback(
    async (openingId: number, key: ReactionKey) => {
      if (!isAuthenticated) return

      // Mock events only exist client-side — toggle locally and remember the
      // result so it survives switching scopes.
      if (openingId < 0) {
        setMock((prev) => {
          const next = applyReaction(prev, openingId, key)
          setCachedGlobalEvents(next)
          return next
        })
        return
      }

      setReal((prev) => applyReaction(prev, openingId, key))

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

  const loading = scope === 'friends' ? loadingReal : loadingReal || loadingMock

  return { events, loading, error, react, refresh }
}
