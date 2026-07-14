'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { CardTier, OpenedPack, PokemonCard } from './pokemon'

/**
 * Client-side collection store, persisted to localStorage.
 *
 * The shape is intentionally flat and serializable so it can be migrated to a
 * database later (each `CollectedCard` maps cleanly to a row keyed by cardId,
 * and each `SetProgress` to a row keyed by setId).
 */

const STORAGE_KEY = 'packrip.collection.v1'
const SCHEMA_VERSION = 1

export interface CollectedCard {
  id: string
  setId: string
  name: string
  number: string
  rarity: string
  tier: CardTier
  foil: boolean
  rainbow: boolean
  imageSmall: string
  imageLarge: string
  /** How many copies pulled (including duplicates) */
  count: number
  firstPulledAt: number
  lastPulledAt: number
}

export interface SetProgress {
  setId: string
  /** Total unique pullable cards in the set (completion denominator) */
  poolTotal: number
  /** Number of packs opened from this set */
  packsOpened: number
}

export interface CollectionData {
  version: number
  /** keyed by card id */
  cards: Record<string, CollectedCard>
  /** keyed by set id */
  sets: Record<string, SetProgress>
  totalPacksOpened: number
  /** total cards pulled including duplicates */
  totalCardsPulled: number
}

function emptyData(): CollectionData {
  return {
    version: SCHEMA_VERSION,
    cards: {},
    sets: {},
    totalPacksOpened: 0,
    totalCardsPulled: 0,
  }
}

/**
 * Stable, frozen empty snapshot for SSR / hydration. Must be referentially
 * stable across calls or useSyncExternalStore throws an infinite-loop warning.
 */
const SERVER_SNAPSHOT: CollectionData = Object.freeze(emptyData())

// ---- Store internals -------------------------------------------------------

let cache: CollectionData | null = null
const listeners = new Set<() => void>()

function read(): CollectionData {
  if (cache) return cache
  if (typeof window === 'undefined') {
    cache = emptyData()
    return cache
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CollectionData
      if (parsed && parsed.version === SCHEMA_VERSION) {
        cache = parsed
        return cache
      }
    }
  } catch {
    // fall through to empty
  }
  cache = emptyData()
  return cache
}

function write(next: CollectionData) {
  cache = next
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore quota / serialization errors
    }
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  // Keep multiple tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null
      listener()
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage)
  }
  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage)
    }
  }
}

// ---- Mutations -------------------------------------------------------------

/** Record every card from an opened pack into the collection. */
export function recordPack(opened: OpenedPack) {
  const data = read()
  const next: CollectionData = {
    ...data,
    cards: { ...data.cards },
    sets: { ...data.sets },
  }
  const now = Date.now()

  const set = next.sets[opened.setId] ?? {
    setId: opened.setId,
    poolTotal: opened.poolTotal,
    packsOpened: 0,
  }
  next.sets[opened.setId] = {
    ...set,
    poolTotal: opened.poolTotal || set.poolTotal,
    packsOpened: set.packsOpened + 1,
  }

  for (const card of opened.cards) {
    const existing = next.cards[card.id]
    if (existing) {
      next.cards[card.id] = {
        ...existing,
        count: existing.count + 1,
        lastPulledAt: now,
      }
    } else {
      next.cards[card.id] = cardFrom(card, opened.setId, now)
    }
  }

  next.totalPacksOpened += 1
  next.totalCardsPulled += opened.cards.length

  write(next)
}

function cardFrom(
  card: PokemonCard,
  setId: string,
  now: number,
): CollectedCard {
  return {
    id: card.id,
    setId,
    name: card.name,
    number: card.number,
    rarity: card.rarity,
    tier: card.tier,
    foil: card.foil,
    rainbow: card.rainbow,
    imageSmall: card.imageSmall,
    imageLarge: card.imageLarge,
    count: 1,
    firstPulledAt: now,
    lastPulledAt: now,
  }
}

export function resetCollection() {
  write(emptyData())
}

// ---- Selectors -------------------------------------------------------------

export interface SetSummary {
  setId: string
  poolTotal: number
  packsOpened: number
  uniqueOwned: number
  totalPulled: number
  duplicates: number
  completion: number
}

export function summarizeSet(
  data: CollectionData,
  setId: string,
): SetSummary {
  const set = data.sets[setId]
  const cards = Object.values(data.cards).filter((c) => c.setId === setId)
  const uniqueOwned = cards.length
  const totalPulled = cards.reduce((n, c) => n + c.count, 0)
  const poolTotal = set?.poolTotal ?? 0
  return {
    setId,
    poolTotal,
    packsOpened: set?.packsOpened ?? 0,
    uniqueOwned,
    totalPulled,
    duplicates: totalPulled - uniqueOwned,
    completion: poolTotal > 0 ? uniqueOwned / poolTotal : 0,
  }
}

export function cardsForSet(
  data: CollectionData,
  setId: string,
): CollectedCard[] {
  return Object.values(data.cards)
    .filter((c) => c.setId === setId)
    .sort((a, b) => {
      const an = parseInt(a.number, 10)
      const bn = parseInt(b.number, 10)
      if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn
      return a.number.localeCompare(b.number)
    })
}

// ---- Hooks -----------------------------------------------------------------

export function useCollection() {
  const data = useSyncExternalStore(
    subscribe,
    read,
    () => SERVER_SNAPSHOT,
  )

  const record = useCallback((opened: OpenedPack) => recordPack(opened), [])
  const reset = useCallback(() => resetCollection(), [])

  return { data, record, reset }
}
