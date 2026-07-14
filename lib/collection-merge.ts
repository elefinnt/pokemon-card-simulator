import type { OpenedPack, PokemonCard } from './pokemon'
import {
  type CollectionData,
  type CollectedCard,
  emptyCollection,
} from './collection-types'

function cardFrom(
  card: PokemonCard,
  setId: string,
  now: number,
): CollectedCard {
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
    count: 1,
    firstPulledAt: now,
    lastPulledAt: now,
  }
}

/** Merge an opened pack into a collection snapshot (pure, no side effects). */
export function mergePackIntoCollection(
  data: CollectionData,
  opened: OpenedPack,
  now = Date.now(),
): CollectionData {
  const next: CollectionData = {
    ...data,
    cards: { ...data.cards },
    sets: { ...data.sets },
  }

  const set = next.sets[opened.setId] ?? {
    setId: opened.setId,
    poolTotal: opened.poolTotal,
    packsOpened: 0,
  }
  next.sets[opened.setId] = {
    ...set,
    poolTotal: opened.poolTotal || set.poolTotal,
    packsOpened: set.packsOpened + 1,
  }

  for (const card of opened.cards) {
    const existing = next.cards[card.id]
    if (existing) {
      next.cards[card.id] = {
        ...existing,
        count: existing.count + 1,
        lastPulledAt: now,
      }
    } else {
      next.cards[card.id] = cardFrom(card, opened.setId, now)
    }
  }

  next.totalPacksOpened += 1
  next.totalCardsPulled += opened.cards.length

  return next
}

/** Merge a guest localStorage collection into an account collection. */
export function mergeCollections(
  base: CollectionData,
  incoming: CollectionData,
): CollectionData {
  let next = { ...base, cards: { ...base.cards }, sets: { ...base.sets } }

  for (const card of Object.values(incoming.cards)) {
    const existing = next.cards[card.id]
    if (existing) {
      next.cards[card.id] = {
        ...existing,
        count: existing.count + card.count,
        firstPulledAt: Math.min(existing.firstPulledAt, card.firstPulledAt),
        lastPulledAt: Math.max(existing.lastPulledAt, card.lastPulledAt),
      }
    } else {
      next.cards[card.id] = { ...card }
    }
  }

  for (const [setId, incomingSet] of Object.entries(incoming.sets)) {
    const existing = next.sets[setId]
    if (existing) {
      next.sets[setId] = {
        setId,
        poolTotal: Math.max(existing.poolTotal, incomingSet.poolTotal),
        packsOpened: existing.packsOpened + incomingSet.packsOpened,
      }
    } else {
      next.sets[setId] = { ...incomingSet }
    }
  }

  next.totalPacksOpened += incoming.totalPacksOpened
  next.totalCardsPulled += incoming.totalCardsPulled

  return next
}

export function isValidCollectionData(value: unknown): value is CollectionData {
  if (!value || typeof value !== 'object') return false
  const data = value as CollectionData
  return (
    typeof data.version === 'number' &&
    typeof data.cards === 'object' &&
    data.cards !== null &&
    typeof data.sets === 'object' &&
    data.sets !== null &&
    typeof data.totalPacksOpened === 'number' &&
    typeof data.totalCardsPulled === 'number'
  )
}

export { emptyCollection }
