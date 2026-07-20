import snapshot from './pool-snapshot.json'
import type { RawCard } from './types'

/**
 * A build-time snapshot of curated card pools, committed to the repo.
 *
 * It exists so the very first open of a set is instant even on a cold serverless
 * instance or a fresh deploy — the in-memory cache and Next.js data cache are
 * both empty in that moment, so without this the request would block on a slow
 * paginated round-trip to the external Pokémon TCG API.
 *
 * Regenerate with `pnpm snapshot` whenever the curated set list changes.
 */
interface PoolSnapshot {
  generatedAt: string | null
  sets: Record<string, RawCard[]>
}

const data = snapshot as PoolSnapshot

/** Snapshotted card pool for a set, or `undefined` if none was captured. */
export function getSnapshotForSet(setId: string): RawCard[] | undefined {
  const cards = data.sets?.[setId]
  return cards && cards.length > 0 ? cards : undefined
}

export function snapshotGeneratedAt(): string | null {
  return data.generatedAt
}
