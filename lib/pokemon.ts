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
}

export interface OpenedPack {
  setId: string
  cards: PokemonCard[]
  /** Index of the guaranteed "hit" (rare slot) card within `cards` */
  hitIndex: number
  bestTier: CardTier
  /** Official set total used as the completion denominator */
  poolTotal: number
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

async function buildPool(setId: string): Promise<Pool> {
  const raw = await getCardsForSet(setId)
  const pool: Pool = { common: [], uncommon: [], rare: [], ultra: [] }

  for (const card of raw) {
    if (!card.images?.small) continue
    const mapped = toCard(card)
    pool[mapped.tier].push(mapped)
  }

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

function sortByNumber<T extends { number: string }>(cards: T[]): T[] {
  return [...cards].sort((a, b) => {
    const an = parseInt(a.number, 10)
    const bn = parseInt(b.number, 10)
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn
    return a.number.localeCompare(b.number)
  })
}

/** All pullable cards in a set, sorted by number — used for the collection binder. */
export async function getSetCatalogue(setId: string): Promise<PokemonCard[]> {
  const raw = await getCardsForSet(setId)
  const cards = raw.filter((c) => c.images?.small).map(toCard)
  return sortByNumber(cards)
}

export async function openPack(setId: string): Promise<OpenedPack> {
  await ensurePacksLoaded()
  const def = getPack(setId)
  if (!def) throw new Error(`Unknown pack: ${setId}`)

  const pool = await buildPool(setId)
  const size = def.packSize
  const poolTotal = def.total > 0 ? def.total : pullableCount(pool)

  const commonCount = Math.max(1, size - 4)
  const uncommonCount = 3

  const cards: PokemonCard[] = []
  cards.push(...draw(commonCount, pool.common, pool.uncommon, pool.rare))
  cards.push(...draw(uncommonCount, pool.uncommon, pool.common, pool.rare))

  const wantUltra = pool.ultra.length > 0 && Math.random() < 0.16
  const hit = wantUltra
    ? draw(1, pool.ultra, pool.rare, pool.uncommon)[0]
    : draw(1, pool.rare, pool.ultra, pool.uncommon, pool.common)[0]

  const hitIndex = cards.length
  if (hit) cards.push(hit)

  const bestTier = cards.reduce<CardTier>(
    (best, c) => (TIER_RANK[c.tier] > TIER_RANK[best] ? c.tier : best),
    'common',
  )

  return { setId, cards, hitIndex, bestTier, poolTotal }
}
