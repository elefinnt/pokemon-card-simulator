import type { CardTier } from './pokemon'
import type { BinderCard } from './collection-types'
import { compareCardNumber } from './card-order'
import { TIER_RANK } from './pokemontcg/rarity'
import { TIER_META } from './rarity'

export type SetTierFilter = CardTier | 'all'
export type SetCardSort = 'number' | 'name' | 'rarity'

export interface SetCardFilters {
  tier: SetTierFilter
  sort: SetCardSort
}

export const DEFAULT_SET_CARD_FILTERS: SetCardFilters = {
  tier: 'all',
  sort: 'number',
}

export interface TierOption {
  value: CardTier
  label: string
  count: number
}

/** Tiers present in the displayed card list, best-to-worst, with counts. */
export function availableSetTiers(cards: BinderCard[]): TierOption[] {
  const counts = new Map<CardTier, number>()
  for (const card of cards) {
    counts.set(card.tier, (counts.get(card.tier) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: TIER_META[value].label, count }))
    .sort((a, b) => TIER_RANK[b.value] - TIER_RANK[a.value])
}

function compareCards(a: BinderCard, b: BinderCard, sort: SetCardSort): number {
  switch (sort) {
    case 'name':
      return a.name.localeCompare(b.name)
    case 'rarity':
      return (
        TIER_RANK[b.tier] - TIER_RANK[a.tier] ||
        compareCardNumber(a.number, b.number)
      )
    case 'number':
    default:
      return compareCardNumber(a.number, b.number)
  }
}

/** Filter by tier, then sort the remaining cards. */
export function filterSetCards(
  cards: BinderCard[],
  filters: SetCardFilters,
): BinderCard[] {
  const filtered =
    filters.tier === 'all'
      ? cards
      : cards.filter((card) => card.tier === filters.tier)

  return [...filtered].sort((a, b) => compareCards(a, b, filters.sort))
}
