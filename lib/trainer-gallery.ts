import type { PokemonCard } from './pokemon'

/**
 * Sword & Shield Trainer Gallery packs (Brilliant Stars, Astral Radiance,
 * Lost Origin, Silver Tempest).
 *
 * The gallery replaces the reverse-holo slot in about one pack in eight
 * (0.125). Community samples for all four sets sit near that rate. Within a
 * gallery hit, weights follow a 360-pack Brilliant Stars sample (shares of
 * the gallery hit, not of every pack): base holo 0.63, V 0.15, VMAX 0.04,
 * full-art trainer ultra 0.11, secret 0.07.
 *
 * The rare slot keeps the sim-wide ultra chance (0.16, or 0.75 when boosted).
 */

const GALLERY_CHANCE = 0.125
/** Guest boost. Crown Zenith uses the same 0.7 gallery chance when boosted. */
const BOOSTED_GALLERY_CHANCE = 0.7

/** Matches ULTRA_HIT_CHANCE / BOOSTED_ULTRA_HIT_CHANCE in lib/pokemon.ts. */
const ULTRA_HIT_CHANCE = 0.16
const BOOSTED_ULTRA_HIT_CHANCE = 0.75

const GALLERY_MIX = {
  secret: 0.07,
  vmax: 0.04,
  trainer: 0.11,
  v: 0.15,
  holo: 0.63,
} as const

type GalleryKind = keyof typeof GALLERY_MIX

const GALLERY_ORDER: GalleryKind[] = ['secret', 'vmax', 'trainer', 'v', 'holo']

const TRAINER_GALLERY_SET_IDS: Record<string, string> = {
  swsh9: 'swsh9tg',
  swsh10: 'swsh10tg',
  swsh11: 'swsh11tg',
  swsh12: 'swsh12tg',
}

export function trainerGalleryCompanionId(setId: string): string | undefined {
  return TRAINER_GALLERY_SET_IDS[setId]
}

function rarityKey(card: PokemonCard): string {
  return card.rarity.toLowerCase().trim()
}

/** Bucket by rarity keywords so a slightly different gallery mix still works. */
function galleryKind(card: PokemonCard): GalleryKind {
  const rarity = rarityKey(card)
  if (rarity.includes('secret') || rarity.includes('gold')) return 'secret'
  if (rarity.includes('vmax') || rarity.includes('vstar')) return 'vmax'
  if (/(^|[^a-z])v([^a-z]|$)/.test(rarity)) return 'v'
  if (rarity.includes('ultra')) return 'trainer'
  return 'holo'
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

function asReverseHolo(card: PokemonCard): PokemonCard {
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

function rollGalleryKind(): GalleryKind {
  const roll = Math.random()
  let cursor = 0
  for (const kind of GALLERY_ORDER) {
    cursor += GALLERY_MIX[kind]
    if (roll < cursor) return kind
  }
  return 'holo'
}

function rollGalleryCard(
  buckets: Record<GalleryKind, PokemonCard[]>,
  all: PokemonCard[],
): PokemonCard | undefined {
  const kind = rollGalleryKind()
  return pickOr(buckets[kind], all)
}

/**
 * 10-card pack: 5 main commons, 3 main uncommons, a reverse-or-gallery slot,
 * then a rare-or-better closer. Extra slots (if packSize > 10) are commons.
 */
export function buildTrainerGalleryCards(
  mainCards: PokemonCard[],
  galleryCards: PokemonCard[],
  size: number,
  boostHit = false,
): PokemonCard[] {
  const commons = mainCards.filter((card) => card.tier === 'common')
  const uncommons = mainCards.filter((card) => card.tier === 'uncommon')
  const rares = mainCards.filter((card) => card.tier === 'rare')
  const ultras = mainCards.filter((card) => card.tier === 'ultra')
  const reversePool = [...commons, ...uncommons, ...rares]

  const buckets: Record<GalleryKind, PokemonCard[]> = {
    secret: [],
    vmax: [],
    trainer: [],
    v: [],
    holo: [],
  }
  for (const card of galleryCards) buckets[galleryKind(card)].push(card)

  const cards: PokemonCard[] = []
  cards.push(...drawMany(Math.max(1, size - 5), commons, uncommons, rares))
  cards.push(...drawMany(3, uncommons, commons, rares))

  const galleryChance = boostHit ? BOOSTED_GALLERY_CHANCE : GALLERY_CHANCE
  const galleryHit =
    galleryCards.length > 0 && Math.random() < galleryChance
      ? rollGalleryCard(buckets, galleryCards)
      : undefined
  if (galleryHit) {
    cards.push(galleryHit)
  } else {
    const reverse = pick(reversePool)
    if (reverse) cards.push(asReverseHolo(reverse))
  }

  const ultraChance = boostHit ? BOOSTED_ULTRA_HIT_CHANCE : ULTRA_HIT_CHANCE
  const closer =
    ultras.length > 0 && Math.random() < ultraChance
      ? pickOr(ultras, rares, uncommons)
      : pickOr(rares, ultras, uncommons, commons)
  if (closer) cards.push(closer)

  return cards
}
