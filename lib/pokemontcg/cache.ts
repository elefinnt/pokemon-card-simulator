/**
 * In-memory cache with stale-while-revalidate fallback.
 *
 * - Fresh entries are served immediately (default 24 h).
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

export interface CacheOptions {
  freshMs?: number
  staleMs?: number
}

export async function cached<T>(
  key: string,
  loader: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const freshMs = options.freshMs ?? FRESH_TTL_MS
  const staleMs = options.staleMs ?? STALE_TTL_MS
  const now = Date.now()
  const entry = dataStore.get(key) as StaleEntry<T> | undefined

  if (entry && now - entry.fetchedAt < freshMs) {
    return entry.data
  }

  const inflight = inflightStore.get(key)
  if (inflight) return inflight as Promise<T>

  const promise = (async () => {
    try {
      const data = await loader()
      dataStore.set(key, { data, fetchedAt: Date.now() })
      return data
    } catch (err) {
      if (entry && now - entry.fetchedAt < staleMs) {
        return entry.data
      }
      throw err
    } finally {
      inflightStore.delete(key)
    }
  })()

  inflightStore.set(key, promise)
  return promise as Promise<T>
}

export function clearCache(): void {
  dataStore.clear()
  inflightStore.clear()
}
