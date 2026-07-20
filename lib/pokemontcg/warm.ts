import { CURATED_SET_IDS } from '../pack-overrides'
import { ensurePacksLoaded } from '../packs'
import { getCardsForSet } from './cards'

/** How many pools to warm at once — kept low to avoid tripping the API's rate limit. */
const WARM_CONCURRENCY = 3

/** Run tasks with a fixed concurrency limit, in order. */
async function pool<T>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  const queue = [...items]
  const workers = Array.from({ length: Math.min(limit, queue.length) }, () =>
    (async () => {
      for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
        await task(next)
      }
    })(),
  )
  await Promise.all(workers)
}

/**
 * Pre-fetch card pools for every curated set, newest first.
 *
 * The curated list is oldest-first, so we reverse it: the newest sets are the
 * ones users reach for and the ones most likely to be a cold miss after a
 * deploy. Warming runs at a limited concurrency so a cold boot doesn't hammer
 * the external API into rate-limiting us.
 *
 * Safe to fire-and-forget — failures are logged but never block the app.
 */
export async function warmCuratedPools(): Promise<void> {
  await ensurePacksLoaded()

  const newestFirst = [...CURATED_SET_IDS].reverse()
  await pool(newestFirst, WARM_CONCURRENCY, async (id) => {
    try {
      await getCardsForSet(id)
    } catch (err) {
      console.warn(
        `[warm] failed for ${id}:`,
        err instanceof Error ? err.message : err,
      )
    }
  })
}
