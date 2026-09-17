/**
 * Some packs pull cards from a companion subset that still belongs in the
 * parent binder. 30th Celebration boosters can hit Classic Collection reprints,
 * so those cards count toward the main set's completion.
 */

export const BINDER_COMPANION_SETS: Record<string, readonly string[]> = {
  me55: ['me55c'],
}

const FOLDED_COMPANIONS = new Set(
  Object.values(BINDER_COMPANION_SETS).flat(),
)

/** Set ids whose cards belong in this pack's binder. */
export function binderSetIds(setId: string): string[] {
  return [setId, ...(BINDER_COMPANION_SETS[setId] ?? [])]
}

/** Companion subsets that should not get their own binder unless ripped solo. */
export function isFoldedCompanionSet(setId: string): boolean {
  return FOLDED_COMPANIONS.has(setId)
}

/** Pokémon TCG API ids are `{setId}-{number}`; set ids may themselves contain dashes. */
export function setIdFromCardId(cardId: string): string {
  const i = cardId.lastIndexOf('-')
  return i > 0 ? cardId.slice(0, i) : cardId
}
