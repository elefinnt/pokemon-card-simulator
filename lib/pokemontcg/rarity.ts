/**
 * Maps the Pokémon TCG API's free-form `rarity` strings (and `subtypes`) into
 * the four gameplay tiers this simulator uses for pack odds.
 *
 * The API exposes dozens of rarity labels (see GET /v2/rarities), and they vary
 * across eras, so we classify with keyword matching plus a subtype fallback for
 * modern chase cards (V / VMAX / ex / GX ...).
 */

export type CardTier = 'common' | 'uncommon' | 'rare' | 'ultra'

/** Keyword fragments in a rarity label that indicate an ultra / chase card. */
const ULTRA_RARITY_KEYS = [
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
  'star',
  'ace',
  'legend',
]

/** Card subtypes that reliably indicate an ultra / chase card. */
const ULTRA_SUBTYPES = new Set([
  'v',
  'vmax',
  'vstar',
  'v-union',
  'ex',
  'gx',
  'mega',
  'radiant',
  'break',
  'prism star',
])

/** Rarity keywords that specifically get the rainbow / secret-rare overlay. */
const RAINBOW_KEYS = ['rainbow', 'secret', 'hyper', 'illustration', 'shiny']

/** Sort weight for comparing tiers (higher = better pull). */
export const TIER_RANK: Record<CardTier, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  ultra: 3,
}

export function classifyTier(rarity: string, subtypes: string[] = []): CardTier {
  const r = rarity.toLowerCase().trim()
  if (r === '' || r === 'common') return 'common'
  if (r === 'uncommon') return 'uncommon'
  if (ULTRA_RARITY_KEYS.some((k) => r.includes(k))) return 'ultra'
  if (subtypes.some((s) => ULTRA_SUBTYPES.has(s.toLowerCase().trim()))) {
    return 'ultra'
  }
  return 'rare'
}

export function isRainbowCard(rarity: string, tier: CardTier): boolean {
  if (tier !== 'ultra') return false
  const r = rarity.toLowerCase()
  return RAINBOW_KEYS.some((k) => r.includes(k))
}

export function isFoilCard(
  rarity: string,
  tier: CardTier,
  rainbow: boolean,
): boolean {
  return tier === 'ultra' || rarity.toLowerCase().includes('holo') || rainbow
}
