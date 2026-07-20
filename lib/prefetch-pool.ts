const prefetched = new Set<string>()

/**
 * Warm the server-side card pool for a set ahead of the user opening it.
 *
 * Fire-and-forget and deduped per session, so it's cheap to call eagerly from
 * hover / focus handlers. A failed warm-up is forgotten so a later hover can
 * retry.
 */
export function prefetchPool(setId: string): void {
  if (prefetched.has(setId)) return
  prefetched.add(setId)
  fetch(`/api/pool/${setId}`).catch(() => {
    prefetched.delete(setId)
  })
}
