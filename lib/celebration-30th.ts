import type { PokemonCard } from './pokemon'

export const CELEBRATION_30TH_SET_ID = 'me55'
export const CLASSIC_COLLECTION_SET_ID = 'me55c'

/**
 * English 30th Celebration booster odds, exclusive within each hit slot.
 *
 * Chase rarities follow day-one community samples (Tommy13's 4,063-pack stream
 * log, with DigitalTQ and TCGTalk in the same ballpark). Classic reprints use
 * a round-up of our own table rips: 5 in 44 packs (~1 in 8.8) → 1 in 8.
 */
export const CELEBRATION_30TH_RATES = {
  classicCollection: 0.125,
  illustrationRare: 0.192,
  doubleRare: 0.25,
  specialIllustration: 0.056,
  futuristic: 0.01,
} as const

function rarityKey(card: PokemonCard): string {
  return card.rarity.toLowerCase().trim()
}

export function isPikachuRare(card: PokemonCard): boolean {
  return rarityKey(card) === 'pikachu rare'
}

function isIllustrationRare(card: PokemonCard): boolean {
  return rarityKey(card) === 'illustration rare'
}

function isDoubleRare(card: PokemonCard): boolean {
  return rarityKey(card) === 'double rare'
}

function isSpecialIllustration(card: PokemonCard): boolean {
  return rarityKey(card) === 'special illustration rare'
}

function isFuturistic(card: PokemonCard): boolean {
  return rarityKey(card).includes('futuristic')
}

function isPlainRare(card: PokemonCard): boolean {
  return rarityKey(card) === 'rare'
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

/**
 * 30th Celebration recipe: all-foil pack, a guaranteed artist Pikachu, a
 * Classic Collection / Illustration Rare slot, then a rare-or-better closer.
 *
 * Real English packs are 5 cards. Extra slots (if packSize > 5) are fillers.
 */
export function buildCelebration30thCards(
  mainCards: PokemonCard[],
  classicCards: PokemonCard[],
  size: number,
  boostHit = false,
): PokemonCard[] {
  const pikachus = mainCards.filter(isPikachuRare)
  const commons = mainCards.filter((card) => card.tier === 'common')
  const uncommons = mainCards.filter((card) => card.tier === 'uncommon')
  const fillers = [...commons, ...uncommons]
  const rares = mainCards.filter(isPlainRare)
  const illustrationRares = mainCards.filter(isIllustrationRare)
  const doubleRares = mainCards.filter(isDoubleRare)
  const sirs = mainCards.filter(isSpecialIllustration)
  const futuristics = mainCards.filter(isFuturistic)

  const fillerCount = Math.max(1, size - 3)
  const cards: PokemonCard[] = []
  for (let i = 0; i < fillerCount; i++) {
    const filler = pickOr(fillers, rares, mainCards)
    if (filler) cards.push(filler)
  }

  const midHit = rollMidSlot(illustrationRares, classicCards, fillers, rares)
  if (midHit) cards.push(midHit)

  const rareHit = rollRareSlot(
    { rares, doubleRares, sirs, futuristics },
    boostHit,
  )
  if (rareHit) cards.push(rareHit)

  const pikachu = pick(pikachus)
  if (pikachu) cards.push(pikachu)

  return cards
}

function rollMidSlot(
  illustrationRares: PokemonCard[],
  classicCards: PokemonCard[],
  fillers: PokemonCard[],
  rares: PokemonCard[],
): PokemonCard | undefined {
  const roll = Math.random()
  const classicUntil = CELEBRATION_30TH_RATES.classicCollection
  const irUntil = classicUntil + CELEBRATION_30TH_RATES.illustrationRare

  if (roll < classicUntil) {
    return pickOr(classicCards, illustrationRares, fillers, rares)
  }
  if (roll < irUntil) {
    return pickOr(illustrationRares, classicCards, fillers, rares)
  }
  return pickOr(fillers, rares)
}

function rollRareSlot(
  pools: {
    rares: PokemonCard[]
    doubleRares: PokemonCard[]
    sirs: PokemonCard[]
    futuristics: PokemonCard[]
  },
  boostHit: boolean,
): PokemonCard | undefined {
  const { rares, doubleRares, sirs, futuristics } = pools
  const roll = Math.random()

  if (boostHit) {
    if (roll < 0.2) return pickOr(futuristics, sirs, doubleRares, rares)
    if (roll < 0.6) return pickOr(sirs, doubleRares, rares)
    if (roll < 0.9) return pickOr(doubleRares, sirs, rares)
    return pickOr(rares, doubleRares)
  }

  const furUntil = CELEBRATION_30TH_RATES.futuristic
  const sirUntil = furUntil + CELEBRATION_30TH_RATES.specialIllustration
  const drUntil = sirUntil + CELEBRATION_30TH_RATES.doubleRare

  if (roll < furUntil) return pickOr(futuristics, sirs, doubleRares, rares)
  if (roll < sirUntil) return pickOr(sirs, doubleRares, rares)
  if (roll < drUntil) return pickOr(doubleRares, rares)
  return pickOr(rares, doubleRares)
}
