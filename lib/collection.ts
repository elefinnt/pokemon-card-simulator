'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useSession } from 'next-auth/react'
import type { OpenedPack } from './pokemon'
import {
  type CollectionData,
  emptyCollection,
} from './collection-types'
import {
  clearLocalCollection,
  hasLocalCollection,
  readLocalCollection,
  recordLocalPack,
  resetLocalCollection,
  subscribeLocalCollection,
} from './collection-local'

export type {
  CollectedCard,
  CollectionData,
  SetProgress,
  SetSummary,
} from './collection-types'

export {
  cardsForSet,
  searchCards,
  summarizeSet,
} from './collection-types'

const SERVER_SNAPSHOT: CollectionData = Object.freeze(emptyCollection())

// ---- Remote collection state -----------------------------------------------

let remoteCache: CollectionData | null = null
const remoteListeners = new Set<() => void>()

function notifyRemote() {
  remoteListeners.forEach((l) => l())
}

function subscribeRemote(listener: () => void): () => void {
  remoteListeners.add(listener)
  return () => remoteListeners.delete(listener)
}

function readRemote(): CollectionData {
  return remoteCache ?? SERVER_SNAPSHOT
}

async function fetchRemoteCollection(): Promise<CollectionData | null> {
  const res = await fetch('/api/collection')
  if (!res.ok) return null
  return (await res.json()) as CollectionData
}

async function importLocalIfNeeded(): Promise<CollectionData | null> {
  if (!hasLocalCollection()) return null

  const local = readLocalCollection()
  const res = await fetch('/api/collection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(local),
  })

  if (!res.ok) return null

  clearLocalCollection()
  return (await res.json()) as CollectionData
}

// ---- Hook ------------------------------------------------------------------

export function useCollection() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated' && !!session?.user

  const localData = useSyncExternalStore(
    subscribeLocalCollection,
    readLocalCollection,
    () => SERVER_SNAPSHOT,
  )

  const remoteData = useSyncExternalStore(
    subscribeRemote,
    readRemote,
    () => SERVER_SNAPSHOT,
  )

  const [loading, setLoading] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  const refreshRemote = useCallback(async () => {
    const data = await fetchRemoteCollection()
    if (data) {
      remoteCache = data
      notifyRemote()
    }
    return data
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      remoteCache = null
      notifyRemote()
      return
    }

    let cancelled = false
    setLoading(true)
    setSyncError(null)

    ;(async () => {
      try {
        const imported = await importLocalIfNeeded()
        if (cancelled) return

        if (imported) {
          remoteCache = imported
          notifyRemote()
        } else {
          await refreshRemote()
        }
      } catch {
        if (!cancelled) {
          setSyncError('Could not load your collection.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, refreshRemote])

  const record = useCallback(
    async (opened: OpenedPack) => {
      if (isAuthenticated) {
        await refreshRemote()
        return
      }
      recordLocalPack(opened)
    },
    [isAuthenticated, refreshRemote],
  )

  const reset = useCallback(async () => {
    if (isAuthenticated) {
      const res = await fetch('/api/collection', { method: 'DELETE' })
      if (res.ok) {
        remoteCache = emptyCollection()
        notifyRemote()
      }
      return
    }
    resetLocalCollection()
  }, [isAuthenticated])

  const data = isAuthenticated ? remoteData : localData

  return {
    data,
    record,
    reset,
    loading: isAuthenticated && loading,
    syncError,
    isAuthenticated,
  }
}

/** @deprecated Use reset() from useCollection() instead. */
export function resetCollection() {
  resetLocalCollection()
}

/** @deprecated Guest-only; signed-in opens are recorded server-side. */
export function recordPack(opened: OpenedPack) {
  recordLocalPack(opened)
}
