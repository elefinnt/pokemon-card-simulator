/**
 * In-memory cache with stale-while-revalidate fallback.
 *
 * - Fresh entries are served immediately (default 24 h).
 * - A cold cache can be seeded from a committed snapshot and served instantly
 *   while the live value is fetched in the background.
 * - On fetch failure, a stale entry up to 7 days old is returned instead.
 * - Concurrent callers for the same key share one in-flight promise.
 */

interface StaleEntry<T> {
  data: T
  fetchedAt: number
}

const FRESH_TTL_MS = 24 * 60 * 60 * 1000
const STALE_TTL_MS = 7 * 24 * 60 * 60 * 1000

const dataStore = new Map<string, StaleEntry<unknown>>()
const inflightStore = new Map<string, Promise<unknown>>()

export interface CacheOptions<T = unknown> {
  freshMs?: number
  staleMs?: number
  /**
   * Synchronous fallback for a cold cache. When there is no cached entry yet,
   * the seed is served immediately and the real loader runs in the background
   * to replace it. Return `undefined` when no snapshot is available.
   */
  seed?: () => T | undefined
}

/** Run the loader once per key, sharing the in-flight promise across callers. */
function load<T>(
  key: string,
  loader: () => Promise<T>,
  staleEntry?: StaleEntry<T>,
  staleMs?: number,
): Promise<T> {
  const existing = inflightStore.get(key)
  if (existing) return existing as Promise<T>

  const startedAt = Date.now()
  const promise = (async () => {
    try {
      const data = await loader()
      dataStore.set(key, { data, fetchedAt: Date.now() })
      return data
    } catch (err) {
      if (staleEntry && staleMs && startedAt - staleEntry.fetchedAt < staleMs) {
        return staleEntry.data
      }
      throw err
    } finally {
      inflightStore.delete(key)
    }
  })()

  inflightStore.set(key, promise)
  return promise as Promise<T>
}

export async function cached<T>(
  key: string,
  loader: () => Promise<T>,
  options: CacheOptions<T> = {},
): Promise<T> {
  const freshMs = options.freshMs ?? FRESH_TTL_MS
  const staleMs = options.staleMs ?? STALE_TTL_MS
  const now = Date.now()
  const entry = dataStore.get(key) as StaleEntry<T> | undefined

  if (entry && now - entry.fetchedAt < freshMs) {
    return entry.data
  }

  // Cold cache with a committed snapshot: serve it instantly, refresh in the
  // background so the next open uses live data without ever blocking a user.
  if (!entry && options.seed) {
    const seeded = options.seed()
    if (seeded !== undefined) {
      dataStore.set(key, { data: seeded, fetchedAt: now })
      void load(key, loader).catch(() => {})
      return seeded
    }
  }

  const inflight = inflightStore.get(key)
  if (inflight) return inflight as Promise<T>

  return load(key, loader, entry, staleMs)
}

export function clearCache(): void {
  dataStore.clear()
  inflightStore.clear()
}
