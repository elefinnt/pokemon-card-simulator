import {
  buildCelebration30thCards,
  CELEBRATION_30TH_SET_ID,
  CLASSIC_COLLECTION_SET_ID,
  RGB_MEW_IDS,
  RGB_RARE_LABEL,
} from './celebration-30th'
import {
  buildCrownZenithCards,
  CROWN_ZENITH_SET_ID,
  GALARIAN_GALLERY_SET_ID,
} from './crown-zenith'
import {
  hasIllustrationRares,
  partitionByHitClass,
  rollArtSlot,
  rollRareSlot,
} from './pack-odds'
import {
  buildCelebrationsCards,
  CELEBRATIONS_CLASSIC_SET_ID,
  CELEBRATIONS_SET_ID,
} from './celebrations'
import { sortByCardNumber } from './card-order'
import {
  buildGenerationsCards,
  GENERATIONS_SET_ID,
  RADIANT_COLLECTION_PREFIX,
} from './generations'
import {
  BINDER_COMPANION_SETS,
  cardHasNumberPrefix,
  setIdFromCardId,
} from './set-companions'
import {
  buildTrainerGalleryCards,
  trainerGalleryCompanionId,
} from './trainer-gallery'
import {
  buildDemigodCards,
  buildGodPack,
  rollPackType,
  type PackType,
} from './god-pack'
import { ensurePacksLoaded, getPack } from './packs'
import { getCardsForSet } from './pokemontcg/cards'
import {
  classifyTier,
  isFoilCard,
  isRainbowCard,
  TIER_RANK,
  type CardTier,
} from './pokemontcg/rarity'
import type { RawCard } from './pokemontcg/types'

export type { CardTier }

export interface PokemonCard {
  id: string
  name: string
  number: string
  rarity: string
  supertype: string
  types: string[]
  imageSmall: string
  imageLarge: string
  artist: string | null
  tier: CardTier
  /** Has a holographic shine treatment */
  foil: boolean
  /** Has a rainbow / secret-rare overlay */
  rainbow: boolean
  /** Master Ball foil treatment (Prismatic Evolutions god-pack opener) */
  masterBall?: boolean
}

export interface OpenedPack {
  setId: string
  cards: PokemonCard[]
  /** Index of the guaranteed "hit" (rare slot) card within `cards` */
  hitIndex: number
  bestTier: CardTier
  /** Official set total used as the completion denominator */
  poolTotal: number
  /** Whether this was a normal, demigod or god pack */
  packType: PackType
}

/**
 * All-foil sets. 30th Celebration boosters are holographic throughout, and
 * Celebrations Classic Collection reprints are foil even though their rarity
 * label is not a holo.
 */
const ALL_FOIL_SET_IDS = new Set([
  CELEBRATION_30TH_SET_ID,
  CLASSIC_COLLECTION_SET_ID,
  CELEBRATIONS_CLASSIC_SET_ID,
])

/** Radiant Collection cards are holographic even when listed as Common. */
function isRadiantCollection(raw: RawCard): boolean {
  if (setIdFromCardId(raw.id) !== GENERATIONS_SET_ID) return false
  return cardHasNumberPrefix(
    { id: raw.id, number: raw.number ?? '' },
    RADIANT_COLLECTION_PREFIX,
  )
}

function toCard(raw: RawCard, allFoil = false): PokemonCard {
  const rgb = RGB_MEW_IDS.has(raw.id)
  const rarity = rgb ? RGB_RARE_LABEL : (raw.rarity ?? 'Common')
  const tier = rgb ? 'ultra' : classifyTier(rarity, raw.subtypes ?? [])
  const rainbow = rgb || isRainbowCard(rarity, tier)
  const radiant = isRadiantCollection(raw)
  const foil = allFoil || rgb || radiant || isFoilCard(rarity, tier, rainbow)
  return {
    id: raw.id,
    name: raw.name,
    number: raw.number ?? '',
    rarity,
    supertype: raw.supertype ?? 'Pokémon',
    types: raw.types ?? [],
    imageSmall: raw.images?.small ?? '',
    imageLarge: raw.images?.large ?? raw.images?.small ?? '',
    artist: raw.artist ?? null,
    tier,
    foil,
    rainbow,
  }
}

type Pool = Record<CardTier, PokemonCard[]>

/** Map a set's raw cards into the sim's card shape, dropping any without art. */
async function mapSetCards(setId: string): Promise<PokemonCard[]> {
  const raw = await getCardsForSet(setId)
  const allFoil = ALL_FOIL_SET_IDS.has(setId)
  return raw.filter((card) => card.images?.small).map((card) => toCard(card, allFoil))
}

function groupByTier(cards: PokemonCard[]): Pool {
  const pool: Pool = { common: [], uncommon: [], rare: [], ultra: [] }
  for (const card of cards) pool[card.tier].push(card)
  return pool
}

function pullableCount(pool: Pool): number {
  return (
    pool.common.length +
    pool.uncommon.length +
    pool.rare.length +
    pool.ultra.length
  )
}

function randInt(max: number): number {
  return Math.floor(Math.random() * max)
}

/** Draw `count` cards from `primary`, falling back through `fallbacks` when empty. */
function draw(
  count: number,
  primary: PokemonCard[],
  ...fallbacks: PokemonCard[][]
): PokemonCard[] {
  const sources = [primary, ...fallbacks].filter((s) => s.length > 0)
  if (sources.length === 0) return []

  const out: PokemonCard[] = []
  for (let i = 0; i < count; i++) {
    const source = sources.find((s) => s.length > 0) ?? sources[0]
    out.push(source[randInt(source.length)])
  }
  return out
}

/** All pullable cards in a set, sorted by number — used for the collection binder. */
export async function getSetCatalogue(setId: string): Promise<PokemonCard[]> {
  const cards = await mapSetCards(setId)
  const companions = BINDER_COMPANION_SETS[setId] ?? []
  if (companions.length === 0) return sortByCardNumber(cards)

  const extra = await Promise.all(companions.map((id) => mapSetCards(id)))
  return [
    ...sortByCardNumber(cards),
    ...extra.flatMap((group) => sortByCardNumber(group)),
  ]
}

/** Base odds of the hit slot rolling an Ultra Rare in a normal pack. */
const ULTRA_HIT_CHANCE = 0.16

/**
 * Boosted odds for a guest's final free pack — deliberately juicy so they hit
 * something worth signing in to keep before the free allowance runs out.
 */
const BOOSTED_ULTRA_HIT_CHANCE = 0.75

/** Build a standard booster: fillers plus a single guaranteed hit slot last. */
function buildStandardCards(
  pool: Pool,
  size: number,
  boostHit = false,
): PokemonCard[] {
  if (hasIllustrationRares(pool.ultra)) {
    return buildModernCards(pool, size, boostHit)
  }

  const commonCount = Math.max(1, size - 4)
  const uncommonCount = 3

  const cards: PokemonCard[] = []
  cards.push(...draw(commonCount, pool.common, pool.uncommon, pool.rare))
  cards.push(...draw(uncommonCount, pool.uncommon, pool.common, pool.rare))

  const ultraChance = boostHit ? BOOSTED_ULTRA_HIT_CHANCE : ULTRA_HIT_CHANCE
  const wantUltra = pool.ultra.length > 0 && Math.random() < ultraChance
  const hit = wantUltra
    ? draw(1, pool.ultra, pool.rare, pool.uncommon)[0]
    : draw(1, pool.rare, pool.ultra, pool.uncommon, pool.common)[0]

  if (hit) cards.push(hit)
  return cards
}

/**
 * SV / Mega Evolution style pack: fillers, a reverse/art slot that can upgrade
 * to IR / SIR / Hyper Rare, then a rare slot that can upgrade to Double Rare
 * or Ultra Rare. Pack size stays the same.
 */
function buildModernCards(
  pool: Pool,
  size: number,
  boostHit = false,
): PokemonCard[] {
  const commonCount = Math.max(1, size - 5)
  const uncommonCount = 3
  const groups = partitionByHitClass(pool.ultra)
  const fillers = [...pool.uncommon, ...pool.common]

  const cards: PokemonCard[] = []
  cards.push(...draw(commonCount, pool.common, pool.uncommon, pool.rare))
  cards.push(...draw(uncommonCount, pool.uncommon, pool.common, pool.rare))

  const art = rollArtSlot(groups, fillers)
  if (art) cards.push(art)

  const hit = rollRareSlot(groups, pool.rare, boostHit)
  if (hit) cards.push(hit)
  return cards
}

/** Assemble the final pack payload, deriving best tier and hit position. */
function finalisePack(
  setId: string,
  cards: PokemonCard[],
  poolTotal: number,
  packType: PackType,
): OpenedPack {
  const bestTier = cards.reduce<CardTier>(
    (best, c) => (TIER_RANK[c.tier] > TIER_RANK[best] ? c.tier : best),
    'common',
  )
  // Point at the last card of the best tier so the reveal peaks at the end.
  let hitIndex = 0
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].tier === bestTier) hitIndex = i
  }

  return { setId, cards, hitIndex, bestTier, poolTotal, packType }
}

export interface OpenPackOptions {
  /** Boost the hit slot's odds — used for a guest's final free pack. */
  boostHit?: boolean
}

export async function openPack(
  setId: string,
  options: OpenPackOptions = {},
): Promise<OpenedPack> {
  await ensurePacksLoaded()
  const def = getPack(setId)
  if (!def) throw new Error(`Unknown pack: ${setId}`)

  const allCards = await mapSetCards(setId)
  const pool = groupByTier(allCards)
  const poolTotal = def.total > 0 ? def.total : pullableCount(pool)

  const packType = rollPackType(setId)

  // God pack — a set-specific miracle line-up. Falls through to a normal
  // pack if the signature cards aren't in the catalogue.
  if (packType === 'god') {
    const god = buildGodPack(setId, allCards)
    if (god) return finalisePack(setId, god, poolTotal, 'god')
  }

  const galleryId = trainerGalleryCompanionId(setId)
  let cards: PokemonCard[]
  if (setId === CELEBRATION_30TH_SET_ID) {
    cards = buildCelebration30thCards(
      allCards,
      await mapSetCards(CLASSIC_COLLECTION_SET_ID),
      def.packSize,
      options.boostHit,
    )
  } else if (setId === CROWN_ZENITH_SET_ID) {
    cards = buildCrownZenithCards(
      allCards,
      await mapSetCards(GALARIAN_GALLERY_SET_ID),
      def.packSize,
      options.boostHit,
    )
  } else if (setId === GENERATIONS_SET_ID) {
    cards = buildGenerationsCards(allCards, def.packSize, options.boostHit)
  } else if (setId === CELEBRATIONS_SET_ID) {
    cards = buildCelebrationsCards(
      allCards,
      await mapSetCards(CELEBRATIONS_CLASSIC_SET_ID),
      def.packSize,
      options.boostHit,
    )
  } else if (galleryId) {
    cards = buildTrainerGalleryCards(
      allCards,
      await mapSetCards(galleryId),
      def.packSize,
      options.boostHit,
    )
  } else {
    cards = buildStandardCards(pool, def.packSize, options.boostHit)
  }

  // Demigod pack — a standard pack whose last three slots are chase rares.
  if (packType === 'demigod') {
    const demigod = buildDemigodCards(setId, cards, allCards)
    if (demigod) return finalisePack(setId, demigod, poolTotal, 'demigod')
  }

  return finalisePack(setId, cards, poolTotal, 'normal')
}
