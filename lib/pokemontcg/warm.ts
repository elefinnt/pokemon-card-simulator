import { CURATED_SET_IDS } from '../pack-overrides'
import { ensurePacksLoaded } from '../packs'
import { getCardsForSet } from './cards'

/**
 * Pre-fetch card pools for every curated set.
 * Safe to fire-and-forget — failures are logged but never block the app.
 */
export function warmCuratedPools(): Promise<void> {
  return Promise.all([
    ensurePacksLoaded(),
    ...CURATED_SET_IDS.map((id) =>
      getCardsForSet(id).catch((err) => {
        console.warn(`[warm] failed for ${id}:`, err instanceof Error ? err.message : err)
      }),
    ),
  ]).then(() => undefined)
}
