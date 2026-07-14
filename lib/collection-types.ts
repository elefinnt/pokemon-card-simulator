import type { CardTier, PokemonCard } from './pokemon'

export const COLLECTION_SCHEMA_VERSION = 1

export interface CollectedCard {
  id: string
  setId: string
  name: string
  number: string
  rarity: string
  tier: CardTier
  foil: boolean
  rainbow: boolean
  imageSmall: string
  imageLarge: string
  /** How many copies pulled (including duplicates) */
  count: number
  firstPulledAt: number
  lastPulledAt: number
}

export interface SetProgress {
  setId: string
  /** Total unique pullable cards in the set (completion denominator) */
  poolTotal: number
  /** Number of packs opened from this set */
  packsOpened: number
}

export interface CollectionData {
  version: number
  /** keyed by card id */
  cards: Record<string, CollectedCard>
  /** keyed by set id */
  sets: Record<string, SetProgress>
  totalPacksOpened: number
  /** total cards pulled including duplicates */
  totalCardsPulled: number
}

export function emptyCollection(): CollectionData {
  return {
    version: COLLECTION_SCHEMA_VERSION,
    cards: {},
    sets: {},
    totalPacksOpened: 0,
    totalCardsPulled: 0,
  }
}

export interface SetSummary {
  setId: string
  poolTotal: number
  packsOpened: number
  uniqueOwned: number
  totalPulled: number
  duplicates: number
  completion: number
}

export function summarizeSet(
  data: CollectionData,
  setId: string,
  fallbackTotal = 0,
): SetSummary {
  const set = data.sets[setId]
  const cards = Object.values(data.cards).filter((c) => c.setId === setId)
  const uniqueOwned = cards.length
  const totalPulled = cards.reduce((n, c) => n + c.count, 0)
  const poolTotal = set?.poolTotal || fallbackTotal || 0
  return {
    setId,
    poolTotal,
    packsOpened: set?.packsOpened ?? 0,
    uniqueOwned,
    totalPulled,
    duplicates: totalPulled - uniqueOwned,
    completion: poolTotal > 0 ? uniqueOwned / poolTotal : 0,
  }
}

export function cardsForSet(
  data: CollectionData,
  setId: string,
): CollectedCard[] {
  return Object.values(data.cards)
    .filter((c) => c.setId === setId)
    .sort((a, b) => {
      const an = parseInt(a.number, 10)
      const bn = parseInt(b.number, 10)
      if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn
      return a.number.localeCompare(b.number)
    })
}

export interface BinderCard {
  id: string
  setId: string
  name: string
  number: string
  rarity: string
  tier: CardTier
  foil: boolean
  rainbow: boolean
  imageSmall: string
  imageLarge: string
  owned: boolean
  count: number
}

/** Merge a set catalogue with owned cards for the binder grid. */
export function binderCardsForSet(
  catalogue: PokemonCard[],
  data: CollectionData,
  setId: string,
): BinderCard[] {
  const ownedById = new Map(
    Object.values(data.cards)
      .filter((c) => c.setId === setId)
      .map((c) => [c.id, c]),
  )

  return catalogue.map((card) => {
    const owned = ownedById.get(card.id)
    if (owned) {
      return {
        id: owned.id,
        setId: owned.setId,
        name: owned.name,
        number: owned.number,
        rarity: owned.rarity,
        tier: owned.tier,
        foil: owned.foil,
        rainbow: owned.rainbow,
        imageSmall: owned.imageSmall,
        imageLarge: owned.imageLarge,
        owned: true,
        count: owned.count,
      }
    }
    return {
      id: card.id,
      setId,
      name: card.name,
      number: card.number,
      rarity: card.rarity,
      tier: card.tier,
      foil: card.foil,
      rainbow: card.rainbow,
      imageSmall: card.imageSmall,
      imageLarge: card.imageLarge,
      owned: false,
      count: 0,
    }
  })
}

/** Search owned cards by name (case-insensitive substring match). */
export function searchCards(
  data: CollectionData,
  query: string,
): CollectedCard[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return Object.values(data.cards)
    .filter((c) => c.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name))
}
