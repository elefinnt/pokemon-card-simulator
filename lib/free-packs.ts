'use client'

import { useSyncExternalStore } from 'react'
import { FREE_PACK_LIMIT } from '@/lib/free-packs-config'

export { FREE_PACK_LIMIT }

const STORAGE_KEY = 'packrip.freePacks.v1'

let cache: number | null = null
const listeners = new Set<() => void>()

function read(): number {
  if (cache !== null) return cache
  if (typeof window === 'undefined') {
    cache = 0
    return cache
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const n = raw ? Number.parseInt(raw, 10) : 0
    cache = Number.isFinite(n) && n > 0 ? n : 0
  } catch {
    cache = 0
  }
  return cache
}

function write(next: number) {
  cache = next
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // ignore quota / serialisation errors
    }
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
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

export function readFreePacksUsed(): number {
  return read()
}

/** Count a guest pack open against the free allowance. */
export function recordFreePackOpened(): void {
  write(read() + 1)
}

/** Clear the free-pack tally (e.g. for local testing). */
export function resetFreePacks(): void {
  write(0)
}

export interface FreePackState {
  used: number
  limit: number
  remaining: number
  /** True when the next open is the final free pack — it gets boosted odds. */
  isLastFree: boolean
  /** True once every free pack has been used. */
  exhausted: boolean
}

function deriveState(used: number): FreePackState {
  const remaining = Math.max(0, FREE_PACK_LIMIT - used)
  return {
    used,
    limit: FREE_PACK_LIMIT,
    remaining,
    isLastFree: remaining === 1,
    exhausted: remaining <= 0,
  }
}

/** Reactive view of a guest's remaining free packs. */
export function useFreePacks(): FreePackState {
  const used = useSyncExternalStore(subscribe, read, () => 0)
  return deriveState(used)
}
