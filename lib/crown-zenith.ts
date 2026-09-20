import type { PokemonCard } from './pokemon'

export const CROWN_ZENITH_SET_ID = 'swsh12pt5'
export const GALARIAN_GALLERY_SET_ID = 'swsh12pt5gg'

/**
 * English Crown Zenith booster odds, from TCGplayer's ~1,900-pack sample.
 *
 * Gallery cards replace the reverse-holo slot about once every three packs.
 * Gold VSTARs (GG67–GG70) and full-art gallery trainers sit inside that slot,
 * not the rare slot. The rare slot itself is a little juicier than a typical
 * Sword & Shield pack.
 */
export const CROWN_ZENITH_RATES = {
  /** Any Galarian Gallery card in the reverse slot. */
  galarianGallery: 0.352,
  /** Gold VSTAR (GG67–GG70). About 1 in 125 packs. */
  gold: 0.008,
  /** Full-art gallery trainers (GG57–GG66). About 1 in 13 packs. */
  signatureTrainer: 0.0765,
  /** Rare-slot V / VMAX / VSTAR / Radiant / full art / secret. */
  ultraHit: 0.24,
} as const

const BOOSTED_GALLERY = 0.7
const BOOSTED_ULTRA = 0.75

function rarityKey(card: PokemonCard): string {
  return card.rarity.toLowerCase().trim()
}

function isGoldGallery(card: PokemonCard): boolean {
  return rarityKey(card).includes('secret')
}

function isSignatureTrainer(card: PokemonCard): boolean {
  return (
    card.supertype.toLowerCase() === 'trainer' &&
    rarityKey(card).includes('ultra')
  )
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

function rollReverseSlot(
  gallery: {
    gold: PokemonCard[]
    trainers: PokemonCard[]
    rest: PokemonCard[]
  },
  reversePool: PokemonCard[],
  boostHit: boolean,
): PokemonCard | undefined {
  const galleryChance = boostHit
    ? BOOSTED_GALLERY
    : CROWN_ZENITH_RATES.galarianGallery
  if (Math.random() >= galleryChance) {
    const reverse = pick(reversePool)
    return reverse ? asReverseHolo(reverse) : undefined
  }

  const goldShare = CROWN_ZENITH_RATES.gold / CROWN_ZENITH_RATES.galarianGallery
  const trainerShare =
    CROWN_ZENITH_RATES.signatureTrainer / CROWN_ZENITH_RATES.galarianGallery
  const inner = Math.random()

  if (inner < goldShare) {
    return pickOr(gallery.gold, gallery.trainers, gallery.rest)
  }
  if (inner < goldShare + trainerShare) {
    return pickOr(gallery.trainers, gallery.rest, gallery.gold)
  }
  return pickOr(gallery.rest, gallery.trainers, gallery.gold)
}

/**
 * Crown Zenith recipe: 5 commons, 3 uncommons, a reverse-or-gallery slot,
 * then a rare-or-better closer. Extra slots (if packSize > 10) are fillers.
 */
export function buildCrownZenithCards(
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

  const gallery = {
    gold: galleryCards.filter(isGoldGallery),
    trainers: galleryCards.filter(isSignatureTrainer),
    rest: galleryCards.filter(
      (card) => !isGoldGallery(card) && !isSignatureTrainer(card),
    ),
  }

  const commonCount = Math.max(1, size - 5)
  const cards: PokemonCard[] = []
  cards.push(...drawMany(commonCount, commons, uncommons, rares))
  cards.push(...drawMany(3, uncommons, commons, rares))

  const reverse = rollReverseSlot(gallery, reversePool, boostHit)
  if (reverse) cards.push(reverse)

  const ultraChance = boostHit ? BOOSTED_ULTRA : CROWN_ZENITH_RATES.ultraHit
  const hit =
    ultras.length > 0 && Math.random() < ultraChance
      ? pickOr(ultras, rares, uncommons)
      : pickOr(rares, ultras, uncommons, commons)
  if (hit) cards.push(hit)

  return cards
}
