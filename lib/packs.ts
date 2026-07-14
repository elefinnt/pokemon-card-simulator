import {
  CURATED_SET_IDS,
  FALLBACK_SET_META,
  PACK_OVERRIDES,
  type CuratedSetId,
  type PackOverride,
} from './pack-overrides'
import { getSetsByIds } from './pokemontcg/sets'
import type { RawSet } from './pokemontcg/types'

export interface PackDef {
  /** Pokémon TCG API set id */
  id: string
  name: string
  series: string
  year: string
  /** Number of cards per booster */
  packSize: number
  /** Official set total from the API — used as the completion denominator */
  total: number
  /** Accent colour used for the pack art gradient (hex) */
  accentFrom: string
  accentTo: string
  blurb: string
}

let packsCache: PackDef[] | null = null
let packsPromise: Promise<PackDef[]> | null = null

function yearFromReleaseDate(date?: string): string {
  if (!date) return '—'
  return date.slice(0, 4)
}

function buildPackDef(set: RawSet, override: PackOverride): PackDef {
  return {
    id: set.id,
    name: set.name,
    series: set.series,
    year: yearFromReleaseDate(set.releaseDate),
    packSize: override.packSize ?? 10,
    total: set.total ?? set.printedTotal ?? 0,
    accentFrom: override.accentFrom,
    accentTo: override.accentTo,
    blurb: override.blurb,
  }
}

function buildFallbackPack(id: CuratedSetId): PackDef {
  const meta = FALLBACK_SET_META[id]
  const override = PACK_OVERRIDES[id]
  return {
    id,
    name: meta.name,
    series: meta.series,
    year: meta.year,
    packSize: override.packSize ?? 10,
    total: meta.total,
    accentFrom: override.accentFrom,
    accentTo: override.accentTo,
    blurb: override.blurb,
  }
}

async function loadPacksFromApi(): Promise<PackDef[]> {
  try {
    const sets = await getSetsByIds([...CURATED_SET_IDS])
    const byId = new Map(sets.map((set) => [set.id, set]))

    return CURATED_SET_IDS.map((id) => {
      const set = byId.get(id)
      const override = PACK_OVERRIDES[id]
      if (set) return buildPackDef(set, override)
      return buildFallbackPack(id)
    })
  } catch (err) {
    console.warn(
      '[packs] API unavailable, using fallback catalogue:',
      err instanceof Error ? err.message : err,
    )
    return CURATED_SET_IDS.map((id) => buildFallbackPack(id))
  }
}

/** Load (or return cached) the curated pack catalogue merged with API metadata. */
export function ensurePacksLoaded(): Promise<PackDef[]> {
  if (packsCache) return Promise.resolve(packsCache)
  if (!packsPromise) {
    packsPromise = loadPacksFromApi().then((packs) => {
      packsCache = packs
      return packs
    })
  }
  return packsPromise
}

/** Synchronous lookup — only valid after `ensurePacksLoaded` has resolved. */
export function getPack(id: string): PackDef | undefined {
  return packsCache?.find((p) => p.id === id)
}

/** All loaded packs (empty until catalogue is loaded). */
export function getPacks(): PackDef[] {
  return packsCache ?? []
}

export function packLogo(id: string): string {
  return `https://images.pokemontcg.io/${id}/logo.png`
}

export function packSymbol(id: string): string {
  return `https://images.pokemontcg.io/${id}/symbol.png`
}

/** Unique series labels from the loaded catalogue, sorted alphabetically. */
export function seriesOptions(packs: PackDef[]): string[] {
  return [...new Set(packs.map((p) => p.series))].sort((a, b) =>
    a.localeCompare(b),
  )
}
