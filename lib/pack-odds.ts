/**
 * Per-pack hit tables for modern sets that use Illustration Rares.
 *
 * English SV/ME boosters have two independent hit slots (rare + reverse/art).
 * Boxes and ETBs are just more of those packs: a 36-pack display averages
 * about 3 IRs, it does not guarantee 3–4. ETBs (9 packs) average well under 1.
 *
 * Sources (community samples, not official TPC tables):
 *   TCGplayer — Scarlet & Violet: IR 7.67% (~1 in 13), SIR 3.15%, HR 1.85%,
 *     Double Rare 13.76%, Ultra Rare 6.57%
 *   ThePriceDex — Surging Sparks IR 1 in 13 (~2.8 / 36); Destined Rivals
 *     IR 1 in 12.1 (~3.0 / 36)
 *
 * IR is nudged to 1 in 12 so 36 random packs average ~3 IRs, matching the
 * usual display feel without inventing a guaranteed slot.
 */

export type HitClass =
  | 'illustration'
  | 'specialIllustration'
  | 'hyper'
  | 'doubleRare'
  | 'aceSpec'
  | 'otherUltra'

export const ART_SLOT_RATES = {
  illustration: 1 / 12,
  specialIllustration: 1 / 36,
  hyper: 1 / 70,
  aceSpec: 1 / 20,
} as const

export const RARE_SLOT_RATES = {
  doubleRare: 1 / 7,
  ultraRare: 1 / 15,
} as const

const ART_ROLL: { key: HitClass; rate: number }[] = [
  { key: 'illustration', rate: ART_SLOT_RATES.illustration },
  { key: 'specialIllustration', rate: ART_SLOT_RATES.specialIllustration },
  { key: 'hyper', rate: ART_SLOT_RATES.hyper },
  { key: 'aceSpec', rate: ART_SLOT_RATES.aceSpec },
]

export function classifyHit(rarity: string): HitClass {
  const r = rarity.toLowerCase().trim()
  if (r.includes('special illustration')) return 'specialIllustration'
  if (r.includes('illustration')) return 'illustration'
  if (r.includes('hyper')) return 'hyper'
  if (r.includes('double rare')) return 'doubleRare'
  if (r.includes('ace spec')) return 'aceSpec'
  return 'otherUltra'
}

export function hasIllustrationRares(
  cards: { rarity: string }[],
): boolean {
  return cards.some((c) => classifyHit(c.rarity) === 'illustration')
}

export function partitionByHitClass<T extends { rarity: string }>(
  cards: T[],
): Record<HitClass, T[]> {
  const groups: Record<HitClass, T[]> = {
    illustration: [],
    specialIllustration: [],
    hyper: [],
    doubleRare: [],
    aceSpec: [],
    otherUltra: [],
  }
  for (const card of cards) groups[classifyHit(card.rarity)].push(card)
  return groups
}

function pick<T>(cards: T[]): T | undefined {
  if (cards.length === 0) return undefined
  return cards[Math.floor(Math.random() * cards.length)]
}

/** Reverse / art slot: IR, SIR, Hyper Rare, ACE SPEC, or a filler. */
export function rollArtSlot<T extends { rarity: string }>(
  groups: Record<HitClass, T[]>,
  fillers: T[],
): T | undefined {
  const roll = Math.random()
  let acc = 0
  for (const { key, rate } of ART_ROLL) {
    acc += rate
    if (roll < acc) return pick(groups[key]) ?? pick(fillers)
  }
  return pick(fillers)
}

/** Rare slot: Double Rare, other Ultra Rare, or a plain Rare. */
export function rollRareSlot<T extends { rarity: string }>(
  groups: Record<HitClass, T[]>,
  rares: T[],
  boostHit = false,
): T | undefined {
  if (boostHit && Math.random() < 0.75) {
    return (
      pick(groups.otherUltra) ??
      pick(groups.doubleRare) ??
      pick(groups.specialIllustration) ??
      pick(groups.illustration) ??
      pick(rares)
    )
  }

  const roll = Math.random()
  if (roll < RARE_SLOT_RATES.doubleRare) {
    return pick(groups.doubleRare) ?? pick(rares)
  }
  if (roll < RARE_SLOT_RATES.doubleRare + RARE_SLOT_RATES.ultraRare) {
    return pick(groups.otherUltra) ?? pick(groups.doubleRare) ?? pick(rares)
  }
  return pick(rares) ?? pick(groups.doubleRare)
}
