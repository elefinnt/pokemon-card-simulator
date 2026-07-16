import type { CardTier } from './pokemon'
import type { CollectedCard } from './collection-types'
import { FALLBACK_SET_META } from './pack-overrides'
import { TIER_META } from './rarity'
import { TIER_RANK } from './pokemontcg/rarity'

export type TierFilter = CardTier | 'all'
export type SetFilter = string | 'all'
export type SortMode = 'name' | 'rarity' | 'recent'

export interface ShowcaseFilters {
  query: string
  tier: TierFilter
  setId: SetFilter
  /** Only show foil / rainbow chase cards. */
  specialOnly: boolean
  sort: SortMode
}

export const DEFAULT_FILTERS: ShowcaseFilters = {
  query: '',
  tier: 'all',
  setId: 'all',
  specialOnly: false,
  sort: 'name',
}

/** Human-readable pack name for a set id, falling back to the raw id. */
export function setLabel(setId: string): string {
  return FALLBACK_SET_META[setId as keyof typeof FALLBACK_SET_META]?.name ?? setId
}

export interface TierOption {
  value: CardTier
  label: string
  count: number
}

/** Tiers actually present in the collection, ordered best-to-worst, with counts. */
export function availableTiers(cards: CollectedCard[]): TierOption[] {
  const counts = new Map<CardTier, number>()
  for (const card of cards) {
    counts.set(card.tier, (counts.get(card.tier) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: TIER_META[value].label, count }))
    .sort((a, b) => TIER_RANK[b.value] - TIER_RANK[a.value])
}

export interface SetOption {
  value: string
  label: string
  count: number
}

/** Packs present in the collection, sorted by owned count (desc). */
export function availableSets(cards: CollectedCard[]): SetOption[] {
  const counts = new Map<string, number>()
  for (const card of cards) {
    counts.set(card.setId, (counts.get(card.setId) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: setLabel(value), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

function isSpecial(card: CollectedCard): boolean {
  return card.foil || card.rainbow
}

function compare(a: CollectedCard, b: CollectedCard, sort: SortMode): number {
  switch (sort) {
    case 'rarity':
      return (
        TIER_RANK[b.tier] - TIER_RANK[a.tier] || a.name.localeCompare(b.name)
      )
    case 'recent':
      return b.lastPulledAt - a.lastPulledAt
    case 'name':
    default:
      return a.name.localeCompare(b.name)
  }
}

/** Apply search + tier + pack + special filters, then sort. */
export function filterShowcaseCards(
  cards: CollectedCard[],
  filters: ShowcaseFilters,
): CollectedCard[] {
  const q = filters.query.trim().toLowerCase()

  return cards
    .filter((card) => {
      if (q && !card.name.toLowerCase().includes(q)) return false
      if (filters.tier !== 'all' && card.tier !== filters.tier) return false
      if (filters.setId !== 'all' && card.setId !== filters.setId) return false
      if (filters.specialOnly && !isSpecial(card)) return false
      return true
    })
    .sort((a, b) => compare(a, b, filters.sort))
}
