import type { PokemonCard } from './pokemon'

export const CELEBRATIONS_SET_ID = 'cel25'
export const CELEBRATIONS_CLASSIC_SET_ID = 'cel25c'

/**
 * Celebrations (cel25) English packs are 4 cards.
 *
 * A 778-pack sample put Classic Collection at about 1 in 2.5 (0.40) and a
 * main-set hit at about 1 in 2. Those slots overlap, so they are modelled as
 * two slots plus fillers:
 * - 2 fillers from the plain Rare pool (12 cards)
 * - 1 classic-or-filler slot at 0.40 Classic Collection, otherwise a filler
 * - 1 hit slot. About half the time it is a main-set hit, split holo 0.22,
 *   V 0.16, VMAX 0.08, ultra 0.04, otherwise a plain rare.
 *
 * Main set mix: Rare 12, Rare Holo 6, Rare Holo V 4, Rare Holo VMAX 2,
 * Rare Ultra 1.
 */
const CLASSIC_CHANCE = 0.4
const BOOSTED_CLASSIC_CHANCE = 0.85

const HIT_MIX = {
  holo: 0.22,
  v: 0.16,
  vmax: 0.08,
  ultra: 0.04,
} as const

/** Boosted chase: holos stay common, gold ultra and VMAX become much likelier. */
const BOOSTED_HIT_MIX = {
  holo: 0.2,
  v: 0.22,
  vmax: 0.24,
  ultra: 0.22,
} as const

type HitKind = keyof typeof HIT_MIX

const HIT_ORDER: HitKind[] = ['ultra', 'vmax', 'v', 'holo']

function rarityKey(card: PokemonCard): string {
  return card.rarity.toLowerCase().trim()
}

function hitKind(card: PokemonCard): HitKind | 'rare' {
  const rarity = rarityKey(card)
  if (rarity.includes('ultra') || rarity.includes('secret')) return 'ultra'
  if (rarity.includes('vmax') || rarity.includes('vstar')) return 'vmax'
  if (/(^|[^a-z])v([^a-z]|$)/.test(rarity)) return 'v'
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

function drawMany(count: number, pool: PokemonCard[]): PokemonCard[] {
  const out: PokemonCard[] = []
  for (let i = 0; i < count; i++) {
    const card = pick(pool)
    if (card) out.push(card)
  }
  return out
}

function rollHit(
  pools: Record<HitKind | 'rare', PokemonCard[]>,
  boostHit: boolean,
): PokemonCard | undefined {
  const mix = boostHit ? BOOSTED_HIT_MIX : HIT_MIX
  const roll = Math.random()
  let cursor = 0
  for (const kind of HIT_ORDER) {
    cursor += mix[kind]
    if (roll < cursor) return pickOr(pools[kind], pools.rare)
  }
  return pick(pools.rare)
}

/**
 * 4-card pack: two plain rares, a classic-or-filler slot, then the hit slot.
 * Extra slots (if packSize > 4) are more plain rares.
 */
export function buildCelebrationsCards(
  mainCards: PokemonCard[],
  classicCards: PokemonCard[],
  size: number,
  boostHit = false,
): PokemonCard[] {
  const pools: Record<HitKind | 'rare', PokemonCard[]> = {
    rare: [],
    holo: [],
    v: [],
    vmax: [],
    ultra: [],
  }
  for (const card of mainCards) {
    const kind = hitKind(card)
    pools[kind].push(card)
  }

  const fillerCount = Math.max(1, size - 2)
  const cards: PokemonCard[] = []
  cards.push(...drawMany(fillerCount, pools.rare))

  const classicChance = boostHit ? BOOSTED_CLASSIC_CHANCE : CLASSIC_CHANCE
  const classic =
    classicCards.length > 0 && Math.random() < classicChance
      ? pick(classicCards)
      : pick(pools.rare)
  if (classic) cards.push(classic)

  const hit = rollHit(pools, boostHit)
  if (hit) cards.push(hit)

  return cards
}
