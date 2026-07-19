import { sortByCardNumber } from './card-order'
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

function toCard(raw: RawCard): PokemonCard {
  const rarity = raw.rarity ?? 'Common'
  const tier = classifyTier(rarity, raw.subtypes ?? [])
  const rainbow = isRainbowCard(rarity, tier)
  const foil = isFoilCard(rarity, tier, rainbow)
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
  return raw.filter((card) => card.images?.small).map(toCard)
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
  const raw = await getCardsForSet(setId)
  const cards = raw.filter((c) => c.images?.small).map(toCard)
  return sortByCardNumber(cards)
}

/** Build a standard booster: fillers plus a single guaranteed hit slot last. */
function buildStandardCards(pool: Pool, size: number): PokemonCard[] {
  const commonCount = Math.max(1, size - 4)
  const uncommonCount = 3

  const cards: PokemonCard[] = []
  cards.push(...draw(commonCount, pool.common, pool.uncommon, pool.rare))
  cards.push(...draw(uncommonCount, pool.uncommon, pool.common, pool.rare))

  const wantUltra = pool.ultra.length > 0 && Math.random() < 0.16
  const hit = wantUltra
    ? draw(1, pool.ultra, pool.rare, pool.uncommon)[0]
    : draw(1, pool.rare, pool.ultra, pool.uncommon, pool.common)[0]

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

export async function openPack(setId: string): Promise<OpenedPack> {
  await ensurePacksLoaded()
  const def = getPack(setId)
  if (!def) throw new Error(`Unknown pack: ${setId}`)

  const allCards = await mapSetCards(setId)
  const pool = groupByTier(allCards)
  const poolTotal = def.total > 0 ? def.total : pullableCount(pool)

  const packType = rollPackType(setId)

  // God pack — a fixed, set-specific miracle line-up. Falls through to the
  // standard build if the signature cards aren't in the API data.
  if (packType === 'god') {
    const god = buildGodPack(allCards)
    if (god) return finalisePack(setId, god, poolTotal, 'god')
  }

  const cards = buildStandardCards(pool, def.packSize)

  // Demigod pack — a standard pack salted with three Special Illustration Rares.
  if (packType === 'demigod') {
    const demigod = buildDemigodCards(cards, allCards)
    if (demigod) return finalisePack(setId, demigod, poolTotal, 'demigod')
  }

  return finalisePack(setId, cards, poolTotal, 'normal')
}
