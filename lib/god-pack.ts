/**
 * God Pack / Demigod Pack logic for Prismatic Evolutions (sv8pt5).
 *
 * A real Prismatic Evolutions "God Pack" is a fabled ~1-in-2,000 booster that
 * contains the Master Ball Eevee plus one of every Eeveelution ex Special
 * Illustration Rare, finishing on the Eevee ex SIR. A "Demigod Pack" is a
 * softer version that contains three Special Illustration Rares.
 *
 * This module is client-safe — it only imports card *types* and does no
 * network / server work — so the same helpers can classify a pack on the
 * server (when opening) and in the browser (community feed badges).
 */

import type { PokemonCard } from './pokemon'

export type PackType = 'normal' | 'demigod' | 'god'

/**
 * God / Demigod pack odds.
 *
 * ⚠️ TESTING VALUES — deliberately generous so the feature is easy to trigger.
 * Swap back to the community-estimated production values before shipping:
 *   GOD_PACK_ODDS     = 1 / 2000   // ~0.05%, the widely cited figure
 *   DEMIGOD_PACK_ODDS = 1 / 350    // rough community estimate
 */
export const GOD_PACK_ODDS = 1 / 20
export const DEMIGOD_PACK_ODDS = 1 / 8

/** Prismatic Evolutions is currently the only set with god packs. */
export const GOD_PACK_SET_ID = 'sv8pt5'

/** The Pokémon TCG API rarity label for the set's chase alt-arts. */
const SIR_RARITY = 'Special Illustration Rare'

/** How many SIRs a demigod pack contains. */
const DEMIGOD_SIR_COUNT = 3

/**
 * The Master Ball Eevee opener. The API has no distinct "Master Ball" printing,
 * so we use the common Eevee (#74) and flag it as a Master Ball foil in the sim.
 */
export const MASTER_BALL_EEVEE_ID = `${GOD_PACK_SET_ID}-74`

/**
 * The fixed god-pack line-up, in reveal order: Master Ball Eevee, then one of
 * each Eeveelution ex SIR, building to the Eevee ex SIR finale.
 */
export const GOD_PACK_CARD_IDS: readonly string[] = [
  MASTER_BALL_EEVEE_ID, // Eevee (Master Ball opener)
  `${GOD_PACK_SET_ID}-149`, // Vaporeon ex
  `${GOD_PACK_SET_ID}-153`, // Jolteon ex
  `${GOD_PACK_SET_ID}-146`, // Flareon ex
  `${GOD_PACK_SET_ID}-155`, // Espeon ex
  `${GOD_PACK_SET_ID}-161`, // Umbreon ex
  `${GOD_PACK_SET_ID}-144`, // Leafeon ex
  `${GOD_PACK_SET_ID}-150`, // Glaceon ex
  `${GOD_PACK_SET_ID}-156`, // Sylveon ex
  `${GOD_PACK_SET_ID}-167`, // Eevee ex (finale)
]

export function isGodPackSet(setId: string): boolean {
  return setId === GOD_PACK_SET_ID
}

/** Roll the pack type for a set. Only god-pack sets can return god / demigod. */
export function rollPackType(setId: string): PackType {
  if (!isGodPackSet(setId)) return 'normal'
  const r = Math.random()
  if (r < GOD_PACK_ODDS) return 'god'
  if (r < GOD_PACK_ODDS + DEMIGOD_PACK_ODDS) return 'demigod'
  return 'normal'
}

/** Every Special Illustration Rare in a mapped card list. */
export function specialIllustrationRares(cards: PokemonCard[]): PokemonCard[] {
  return cards.filter((c) => c.rarity === SIR_RARITY)
}

/** Pick `count` distinct random items from `items` (non-mutating). */
function pickDistinct<T>(items: T[], count: number): T[] {
  const pool = [...items]
  const out: T[] = []
  while (out.length < count && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length)
    out.push(pool.splice(i, 1)[0])
  }
  return out
}

/**
 * Build the fixed god-pack card list from the set's full card catalogue.
 * Returns null if any signature card is missing (API data drift) so the caller
 * can gracefully fall back to a demigod or normal pack.
 */
export function buildGodPack(allCards: PokemonCard[]): PokemonCard[] | null {
  const byId = new Map(allCards.map((c) => [c.id, c]))
  const cards: PokemonCard[] = []
  for (const id of GOD_PACK_CARD_IDS) {
    const card = byId.get(id)
    if (!card) return null
    cards.push(
      id === MASTER_BALL_EEVEE_ID
        ? { ...card, foil: true, masterBall: true }
        : card,
    )
  }
  return cards
}

/**
 * Build a demigod pack: a standard pack whose final slots are replaced with
 * three distinct random Special Illustration Rares (kept last for the reveal
 * crescendo). Returns null if the set lacks enough SIRs.
 */
export function buildDemigodCards(
  base: PokemonCard[],
  allCards: PokemonCard[],
): PokemonCard[] | null {
  const sirs = specialIllustrationRares(allCards)
  if (sirs.length < DEMIGOD_SIR_COUNT) return null
  const picks = pickDistinct(sirs, DEMIGOD_SIR_COUNT)
  const kept = base.slice(0, Math.max(0, base.length - picks.length))
  return [...kept, ...picks]
}

/**
 * Infer a pack's type purely from its card list — used by the community feed,
 * which only has the stored cards to work from (no persisted pack type).
 */
export function detectPackType(cards: PokemonCard[], setId: string): PackType {
  if (!isGodPackSet(setId)) return 'normal'
  const sirCount = cards.filter((c) => c.rarity === SIR_RARITY).length
  if (sirCount >= 6) return 'god'
  if (sirCount >= DEMIGOD_SIR_COUNT) return 'demigod'
  return 'normal'
}

export interface PackTypeMeta {
  label: string
  tagline: string
  /** CSS gradient used for the celebratory banner. */
  gradient: string
}

/** Display copy + styling for the special pack types. */
export const PACK_TYPE_META: Record<
  Exclude<PackType, 'normal'>,
  PackTypeMeta
> = {
  god: {
    label: 'GOD PACK',
    tagline: 'Every Eeveelution SIR in one pack — a one-in-a-thousand miracle.',
    gradient: 'linear-gradient(120deg,#fbbf24,#f472b6,#a855f7,#38bdf8)',
  },
  demigod: {
    label: 'DEMIGOD PACK',
    tagline: 'Three Special Illustration Rares in a single pack.',
    gradient: 'linear-gradient(120deg,#a855f7,#ec4899)',
  },
}
