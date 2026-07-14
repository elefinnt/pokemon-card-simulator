import type { OpenedPack } from './pokemon'
import {
  COLLECTION_SCHEMA_VERSION,
  type CollectionData,
  emptyCollection,
} from './collection-types'
import { mergePackIntoCollection } from './collection-merge'

const STORAGE_KEY = 'packrip.collection.v1'

let cache: CollectionData | null = null
const listeners = new Set<() => void>()

function read(): CollectionData {
  if (cache) return cache
  if (typeof window === 'undefined') {
    cache = emptyCollection()
    return cache
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CollectionData
      if (parsed && parsed.version === COLLECTION_SCHEMA_VERSION) {
        cache = parsed
        return cache
      }
    }
  } catch {
    // fall through to empty
  }
  cache = emptyCollection()
  return cache
}

function write(next: CollectionData) {
  cache = next
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
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

export function recordLocalPack(opened: OpenedPack) {
  const data = read()
  write(mergePackIntoCollection(data, opened))
}

export function resetLocalCollection() {
  write(emptyCollection())
}

export function readLocalCollection(): CollectionData {
  return read()
}

export function clearLocalCollection() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }
  cache = null
  listeners.forEach((l) => l())
}

export function hasLocalCollection(): boolean {
  const data = readLocalCollection()
  return Object.keys(data.cards).length > 0 || data.totalPacksOpened > 0
}

export { subscribe as subscribeLocalCollection }
