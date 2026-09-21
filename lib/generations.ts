import type { PokemonCard } from './pokemon'
import { cardHasNumberPrefix } from './set-companions'

export const GENERATIONS_SET_ID = 'g1'
export const RADIANT_COLLECTION_PREFIX = 'RC'

/**
 * Generations (g1) packs, from Elite Fourum sheet notes and ThePriceDex rates.
 * Radiant Collection is embedded in the g1 API set (RC1–RC32), not its own set.
 * Every 10-card pack contains two Radiant Collection cards.
 *
 * RC mid slot, every pack: uncommon 0.72, ultra 0.20, Rare Holo EX 0.08.
 * Sheet print runs uncommons at 6×, ultras at 4×, and the two EX at a similar
 * short print. Those shares sum to about 1.
 *
 * Main-set rare slot: non-holo rare 0.667, holo 0.105, EX 0.204, ultra 0.022.
 */
const RC_MID = { uncommon: 0.72, ultra: 0.2, ex: 0.08 } as const
const BOOSTED_RC_MID = { uncommon: 0.2, ultra: 0.45, ex: 0.35 } as const

const RARE_SLOT = { rare: 0.667, holo: 0.105, ex: 0.204, ultra: 0.022 } as const
const BOOSTED_RARE_SLOT = { rare: 0.12, holo: 0.18, ex: 0.4, ultra: 0.3 } as const

type RcMidKind = keyof typeof RC_MID
type RareKind = keyof typeof RARE_SLOT

export function isRadiantCollectionCard(card: {
  id: string
  number: string
}): boolean {
  return cardHasNumberPrefix(card, RADIANT_COLLECTION_PREFIX)
}

function rarityKey(card: PokemonCard): string {
  return card.rarity.toLowerCase().trim()
}

function radiantKind(card: PokemonCard): RcMidKind | 'common' {
  const rarity = rarityKey(card)
  if (rarity.includes('ex')) return 'ex'
  if (rarity.includes('ultra')) return 'ultra'
  if (rarity === 'uncommon' || card.tier === 'uncommon') return 'uncommon'
  return 'common'
}

function mainHitKind(card: PokemonCard): RareKind {
  const rarity = rarityKey(card)
  if (rarity.includes('ultra')) return 'ultra'
  if (rarity.includes('ex')) return 'ex'
  if (rarity.includes('holo')) return 'holo'
  return 'rare'
}

function randInt(max: number): number {
  return Math.floor(Math.random() * max)
}

function pick(cards: PokemonCard[]): PokemonCard | undefined {
  if (cards.length === 0) return undefined
  return cards[randInt(cards.length)]
}

function pickOr(
  primary: PokemonCard[],
  ...fallbacks: PokemonCard[][]
): PokemonCard | undefined {
  return pick(primary) ?? fallbacks.map(pick).find(Boolean)
}

function asFoil(card: PokemonCard): PokemonCard {
  if (card.foil) return card
  return { ...card, foil: true }
}

function drawMany(
  count: number,
  primary: PokemonCard[],
  ...fallbacks: PokemonCard[][]
): PokemonCard[] {
  const out: PokemonCard[] = []
  for (let i = 0; i < count; i++) {
    const card = pickOr(primary, ...fallbacks)
    if (card) out.push(card)
  }
  return out
}

function rollWeighted<K extends string>(
  weights: Record<K, number>,
  order: readonly K[],
): K {
  const roll = Math.random()
  let cursor = 0
  for (const kind of order) {
    cursor += weights[kind]
    if (roll < cursor) return kind
  }
  return order[order.length - 1]
}

/**
 * 10-card pack: 4 main commons, 2 main uncommons, 1 main reverse holo,
 * 1 Radiant Collection common, 1 Radiant Collection mid, 1 main rare slot.
 * Extra slots (if packSize > 10) are main commons.
 */
export function buildGenerationsCards(
  allCards: PokemonCard[],
  size: number,
  boostHit = false,
): PokemonCard[] {
  const radiant = allCards.filter(isRadiantCollectionCard)
  const main = allCards.filter((card) => !isRadiantCollectionCard(card))

  const commons = main.filter((card) => card.tier === 'common')
  const uncommons = main.filter((card) => card.tier === 'uncommon')
  const reversePool = main.filter((card) => {
    if (card.tier === 'common' || card.tier === 'uncommon') return true
    return mainHitKind(card) === 'rare'
  })

  const rcPools: Record<RcMidKind | 'common', PokemonCard[]> = {
    common: [],
    uncommon: [],
    ultra: [],
    ex: [],
  }
  for (const card of radiant) rcPools[radiantKind(card)].push(card)

  const rarePools: Record<RareKind, PokemonCard[]> = {
    rare: [],
    holo: [],
    ex: [],
    ultra: [],
  }
  for (const card of main) {
    if (card.tier === 'common' || card.tier === 'uncommon') continue
    rarePools[mainHitKind(card)].push(card)
  }

  const cards: PokemonCard[] = []
  cards.push(...drawMany(Math.max(1, size - 6), commons, uncommons))
  cards.push(...drawMany(2, uncommons, commons))

  const reverse = pick(reversePool)
  if (reverse) cards.push(asFoil(reverse))

  const rcCommon = pickOr(rcPools.common, radiant)
  if (rcCommon) cards.push(asFoil(rcCommon))

  const midWeights = boostHit ? BOOSTED_RC_MID : RC_MID
  const midKind = rollWeighted(midWeights, ['ultra', 'ex', 'uncommon'] as const)
  const rcMid = pickOr(rcPools[midKind], radiant)
  if (rcMid) cards.push(asFoil(rcMid))

  const rareWeights = boostHit ? BOOSTED_RARE_SLOT : RARE_SLOT
  const rareKind = rollWeighted(rareWeights, ['ultra', 'ex', 'holo', 'rare'] as const)
  const rare = pickOr(
    rarePools[rareKind],
    rarePools.rare,
    rarePools.holo,
    rarePools.ex,
    rarePools.ultra,
  )
  if (rare) cards.push(rare)

  return cards
}
