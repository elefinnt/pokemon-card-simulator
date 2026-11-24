import { BINDER_COMPANION_SETS } from '@/lib/set-companions'

const prefetched = new Map<string, Promise<void>>()

function warm(setId: string): Promise<void> {
  const existing = prefetched.get(setId)
  if (existing) return existing
  const pending = fetch(`/api/pool/${setId}`).then(res => {
    if (!res.ok) throw new Error('Card pool unavailable')
  }).catch(() => {
    prefetched.delete(setId)
  })
  prefetched.set(setId, pending)
  return pending
}

/**
 * Warm the server-side card pool for a set ahead of the user opening it.
 *
 * Fire-and-forget and deduped per session, so it's cheap to call eagerly from
 * hover / focus handlers. A failed warm-up is forgotten so a later hover can
 * retry.
 */
export async function prefetchPool(setId: string): Promise<void> {
  await Promise.all([setId, ...(BINDER_COMPANION_SETS[setId] ?? [])].map(warm))
}
