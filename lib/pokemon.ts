import { getPack } from './packs'

export type CardTier = 'common' | 'uncommon' | 'rare' | 'ultra'

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
}

interface RawCard {
  id: string
  name: string
  number?: string
  rarity?: string
  supertype?: string
  types?: string[]
  artist?: string
  images?: { small?: string; large?: string }
}

const ULTRA_KEYS = [
  'ex',
  'gx',
  ' v',
  'vmax',
  'vstar',
  'ultra',
  'rainbow',
  'secret',
  'illustration',
  'amazing',
  'double rare',
  'hyper',
  'shiny',
  'full art',
  'radiant',
  'trainer gallery',
  'prism',
]

function classify(rarity: string): CardTier {
  const r = rarity.toLowerCase().trim()
  if (r === '' || r === 'common') return 'common'
  if (r === 'uncommon') return 'uncommon'
  if (ULTRA_KEYS.some((k) => r.includes(k))) return 'ultra'
  return 'rare'
}

function toCard(raw: RawCard): PokemonCard {
  const rarity = raw.rarity ?? 'Common'
  const tier = classify(rarity)
  const r = rarity.toLowerCase()
  const rainbow =
    tier === 'ultra' &&
    ['rainbow', 'secret', 'hyper', 'illustration', 'shiny'].some((k) =>
      r.includes(k),
    )
  const foil = tier === 'ultra' || r.includes('holo') || rainbow
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

const API_BASE = 'https://api.pokemontcg.io/v2'

async function fetchPool(setId: string): Promise<Pool> {
  const url = `${API_BASE}/cards?q=set.id:${encodeURIComponent(
    setId,
  )}&pageSize=250&select=id,name,number,rarity,supertype,types,artist,images`

  const headers: Record<string, string> = {}
  if (process.env.POKEMONTCG_API_KEY) {
    headers['X-Api-Key'] = process.env.POKEMONTCG_API_KEY
  }

  // The public Pokémon TCG API can be slow/flaky, so retry a couple of times
  // with a per-attempt timeout before giving up.
  let lastErr: unknown
  let json: { data?: RawCard[] } | undefined
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(8000),
        // Card lists are static per set — cache for a day.
        next: { revalidate: 86400 },
      })
      if (!res.ok) {
        throw new Error(`Pokémon TCG API responded with ${res.status}`)
      }
      json = (await res.json()) as { data?: RawCard[] }
      break
    } catch (err) {
      lastErr = err
    }
  }

  if (!json) {
    throw lastErr instanceof Error
      ? lastErr
      : new Error('Failed to reach the Pokémon TCG API')
  }

  const pool: Pool = { common: [], uncommon: [], rare: [], ultra: [] }

  for (const raw of json.data ?? []) {
    if (!raw.images?.small) continue
    const card = toCard(raw)
    pool[card.tier].push(card)
  }

  return pool
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

const TIER_RANK: Record<CardTier, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  ultra: 3,
}

export async function openPack(setId: string): Promise<OpenedPack> {
  const def = getPack(setId)
  if (!def) throw new Error(`Unknown pack: ${setId}`)

  const pool = await fetchPool(setId)
  const size = def.packSize

  // Layout: mostly commons, a few uncommons, one guaranteed rare-or-better hit.
  const commonCount = Math.max(1, size - 4)
  const uncommonCount = 3

  const cards: PokemonCard[] = []
  cards.push(...draw(commonCount, pool.common, pool.uncommon, pool.rare))
  cards.push(...draw(uncommonCount, pool.uncommon, pool.common, pool.rare))

  // The hit slot: ~16% chance for an ultra chase card when available.
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

  return { setId, cards, hitIndex, bestTier }
}
