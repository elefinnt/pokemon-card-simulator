/**
 * God pack / demigod pack logic.
 *
 * Prismatic Evolutions (sv8pt5) and Ascended Heroes (me2pt5) can roll a god
 * pack or a demigod pack. Line-ups live in `god-pack-lineups.ts`. This module
 * is client-safe — it only imports card *types* and does no network / server
 * work — so the same helpers can classify a pack on the server (when opening)
 * and in the browser (community feed badges).
 */

import type { PokemonCard } from './pokemon'
import {
  godPackLineup,
  MASTER_BALL_EEVEE_ID,
  PRISMATIC_GOD_PACK_CARD_IDS,
  PRISMATIC_SET_ID,
  SIR_RARITY,
  type GodPackLineup,
} from './god-pack-lineups'

export type PackType = 'normal' | 'demigod' | 'god'

export {
  MASTER_BALL_EEVEE_ID,
  PRISMATIC_GOD_PACK_CARD_IDS as GOD_PACK_CARD_IDS,
  PRISMATIC_SET_ID as GOD_PACK_SET_ID,
}

/** Live rates, shared by every god-pack set. God is checked first. */
export const GOD_PACK_ODDS = 1 / 2000
export const DEMIGOD_PACK_ODDS = 1 / 350

export function isGodPackSet(setId: string): boolean {
  return godPackLineup(setId) !== undefined
}

/** Roll the pack type for a set. Only god-pack sets can return god / demigod. */
export function rollPackType(setId: string): PackType {
  if (!isGodPackSet(setId)) return 'normal'
  const r = Math.random()
  if (r < GOD_PACK_ODDS) return 'god'
  if (r < GOD_PACK_ODDS + DEMIGOD_PACK_ODDS) return 'demigod'
  return 'normal'
}

/** Collapse API labels so `MEGA_ATTACK_RARE` matches "Mega Attack Rare". */
function rarityKey(rarity: string): string {
  return rarity.toLowerCase().trim().replace(/_/g, ' ')
}

function sameRarity(cardRarity: string, expected: string): boolean {
  return rarityKey(cardRarity) === rarityKey(expected)
}

function cardsWithRarity(cards: PokemonCard[], rarity: string): PokemonCard[] {
  return cards.filter((card) => sameRarity(card.rarity, rarity))
}

/** Every Special Illustration Rare in a mapped card list. */
export function specialIllustrationRares(cards: PokemonCard[]): PokemonCard[] {
  return cardsWithRarity(cards, SIR_RARITY)
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

function buildFixedGodPack(
  lineup: Extract<GodPackLineup, { kind: 'fixed' }>,
  allCards: PokemonCard[],
): PokemonCard[] | null {
  const byId = new Map(allCards.map((card) => [card.id, card]))
  const cards: PokemonCard[] = []
  for (const id of lineup.cardIds) {
    const card = byId.get(id)
    if (!card) return null
    cards.push(
      id === lineup.masterBallId
        ? { ...card, foil: true, masterBall: true }
        : card,
    )
  }
  return cards
}

function buildComposedGodPack(
  lineup: Extract<GodPackLineup, { kind: 'composed' }>,
  allCards: PokemonCard[],
): PokemonCard[] | null {
  const cards: PokemonCard[] = []
  for (const slot of lineup.slots) {
    const pool = cardsWithRarity(allCards, slot.rarity)
    if (pool.length < slot.count) return null
    cards.push(...pickDistinct(pool, slot.count))
  }
  return cards
}

/**
 * Build a god pack from the set's catalogue.
 * Returns null if any signature card or rarity pool is missing, so the caller
 * can fall back to a normal pack.
 */
export function buildGodPack(
  setId: string,
  allCards: PokemonCard[],
): PokemonCard[] | null {
  const lineup = godPackLineup(setId)
  if (!lineup) return null
  if (lineup.kind === 'fixed') return buildFixedGodPack(lineup, allCards)
  return buildComposedGodPack(lineup, allCards)
}

/**
 * Build a demigod pack: a standard pack whose final slots are replaced with
 * three distinct chase cards (Special Illustration Rares for both current
 * sets), kept last for the reveal. Returns null if the set lacks enough.
 */
export function buildDemigodCards(
  setId: string,
  base: PokemonCard[],
  allCards: PokemonCard[],
): PokemonCard[] | null {
  const lineup = godPackLineup(setId)
  if (!lineup) return null
  const chase = cardsWithRarity(allCards, lineup.chaseRarity)
  if (chase.length < lineup.demigodCount) return null
  const picks = pickDistinct(chase, lineup.demigodCount)
  const kept = base.slice(0, Math.max(0, base.length - picks.length))
  return [...kept, ...picks]
}

/**
 * Infer a pack's type from its card list. The community feed only has the
 * stored cards (no persisted pack type).
 *
 * God: 6+ chase cards (Prismatic god packs have 9 SIRs, Ascended Heroes god
 * packs have 7). Demigod: 3+ chase cards. A normal modern pack tops out at
 * two SIRs, so this does not flag ordinary opens.
 */
export function detectPackType(cards: PokemonCard[], setId: string): PackType {
  const lineup = godPackLineup(setId)
  if (!lineup) return 'normal'
  const chaseCount = cards.filter((card) =>
    sameRarity(card.rarity, lineup.chaseRarity),
  ).length
  if (chaseCount >= lineup.godChaseMin) return 'god'
  if (chaseCount >= lineup.demigodCount) return 'demigod'
  return 'normal'
}

export interface PackTypeMeta {
  label: string
  tagline: string
  /** CSS gradient used for the celebratory banner. */
  gradient: string
}

/** Shared banner chrome. Taglines are set-specific via `getPackTypeMeta`. */
export const PACK_TYPE_META: Record<
  Exclude<PackType, 'normal'>,
  PackTypeMeta
> = {
  god: {
    label: 'GOD PACK',
    tagline:
      'Every Eeveelution SIR in one pack — a one-in-a-thousand miracle.',
    gradient: 'linear-gradient(120deg,#fbbf24,#f472b6,#a855f7,#38bdf8)',
  },
  demigod: {
    label: 'DEMIGOD PACK',
    tagline: 'Three Special Illustration Rares in a single pack.',
    gradient: 'linear-gradient(120deg,#a855f7,#ec4899)',
  },
}

/** Banner copy for a special pack. Unknown sets keep the shared defaults. */
export function getPackTypeMeta(
  packType: Exclude<PackType, 'normal'>,
  setId: string,
): PackTypeMeta {
  const lineup = godPackLineup(setId)
  const base = PACK_TYPE_META[packType]
  if (!lineup) return base
  return {
    ...base,
    tagline: packType === 'god' ? lineup.godTagline : lineup.demigodTagline,
  }
}
