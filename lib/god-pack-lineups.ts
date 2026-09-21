/**
 * Per-set god-pack line-ups.
 *
 * Prismatic Evolutions is a fixed script: Master Ball Eevee, then every
 * Eeveelution ex Special Illustration Rare, ending on Eevee ex.
 *
 * Ascended Heroes is a fixed *composition*, not a fixed script. English
 * sources (PokeBeach, TCGplayer, CardDeckr) describe every god pack as
 * three Mega Attack Rares and seven Special Illustration Rares, drawn from
 * those pools. The Japanese source set (MEGA Dream ex) uses a different mix,
 * so this file follows the English product.
 */

export const PRISMATIC_SET_ID = 'sv8pt5'
export const ASCENDED_HEROES_SET_ID = 'me2pt5'

/** Chase rarity shared by both god-pack sets. Demigods are three of these. */
export const SIR_RARITY = 'Special Illustration Rare'

/**
 * Snapshot label for Ascended Heroes Mega Attack Rares (`MEGA_ATTACK_RARE`).
 * Matching is normalised, so a spaced "Mega Attack Rare" label also counts.
 */
export const MEGA_ATTACK_RARITY = 'MEGA_ATTACK_RARE'

const DEMIGOD_TAGLINE = 'Three Special Illustration Rares in a single pack.'

export interface GodPackSlot {
  rarity: string
  count: number
}

interface GodPackLineupBase {
  setId: string
  /** Rarity counted for demigod / god detection. */
  chaseRarity: string
  demigodCount: number
  /**
   * Chase cards at or above this count are a god pack.
   * Both sets land above 6 (Prismatic has 9 SIRs, Ascended Heroes has 7)
   * while a demigod has exactly 3, so 6 separates them from normal packs.
   */
  godChaseMin: number
  godTagline: string
  demigodTagline: string
}

export interface FixedGodPackLineup extends GodPackLineupBase {
  kind: 'fixed'
  cardIds: readonly string[]
  /** Card id that should render as a Master Ball foil. */
  masterBallId?: string
}

export interface ComposedGodPackLineup extends GodPackLineupBase {
  kind: 'composed'
  /** Reveal order. The last slot group is the finale. */
  slots: readonly GodPackSlot[]
}

export type GodPackLineup = FixedGodPackLineup | ComposedGodPackLineup

/**
 * The Master Ball Eevee opener. The API has no distinct Master Ball printing,
 * so the sim uses the common Eevee (#74) and flags it as a Master Ball foil.
 */
export const MASTER_BALL_EEVEE_ID = `${PRISMATIC_SET_ID}-74`

/** Prismatic god pack, in reveal order. Eevee ex SIR is the finale. */
export const PRISMATIC_GOD_PACK_CARD_IDS: readonly string[] = [
  MASTER_BALL_EEVEE_ID, // Eevee (Master Ball opener)
  `${PRISMATIC_SET_ID}-149`, // Vaporeon ex
  `${PRISMATIC_SET_ID}-153`, // Jolteon ex
  `${PRISMATIC_SET_ID}-146`, // Flareon ex
  `${PRISMATIC_SET_ID}-155`, // Espeon ex
  `${PRISMATIC_SET_ID}-161`, // Umbreon ex
  `${PRISMATIC_SET_ID}-144`, // Leafeon ex
  `${PRISMATIC_SET_ID}-150`, // Glaceon ex
  `${PRISMATIC_SET_ID}-156`, // Sylveon ex
  `${PRISMATIC_SET_ID}-167`, // Eevee ex (finale)
]

/**
 * Ascended Heroes god pack, in reveal order: three Mega Attack Rares
 * (#265–#271), then seven Special Illustration Rares (#272–#293).
 * The last card is always an SIR.
 */
const ASCENDED_HEROES_GOD_SLOTS: readonly GodPackSlot[] = [
  { rarity: MEGA_ATTACK_RARITY, count: 3 },
  { rarity: SIR_RARITY, count: 7 },
]

const LINEUPS: Record<string, GodPackLineup> = {
  [PRISMATIC_SET_ID]: {
    kind: 'fixed',
    setId: PRISMATIC_SET_ID,
    cardIds: PRISMATIC_GOD_PACK_CARD_IDS,
    masterBallId: MASTER_BALL_EEVEE_ID,
    chaseRarity: SIR_RARITY,
    demigodCount: 3,
    godChaseMin: 6,
    godTagline:
      'Every Eeveelution SIR in one pack — a one-in-a-thousand miracle.',
    demigodTagline: DEMIGOD_TAGLINE,
  },
  [ASCENDED_HEROES_SET_ID]: {
    kind: 'composed',
    setId: ASCENDED_HEROES_SET_ID,
    slots: ASCENDED_HEROES_GOD_SLOTS,
    chaseRarity: SIR_RARITY,
    demigodCount: 3,
    godChaseMin: 6,
    godTagline:
      'Three Mega Attack Rares and seven Special Illustration Rares in one pack.',
    demigodTagline: DEMIGOD_TAGLINE,
  },
}

export function godPackLineup(setId: string): GodPackLineup | undefined {
  return LINEUPS[setId]
}
