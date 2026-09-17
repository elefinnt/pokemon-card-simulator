/**
 * Some packs pull cards from a companion subset that still belongs in the
 * parent binder. 30th Celebration boosters can hit Classic Collection reprints,
 * so those cards count toward the main set's completion.
 */

export const BINDER_COMPANION_SETS: Record<string, readonly string[]> = {
  me55: ['me55c'],
}

export interface BinderGroup {
  setId: string
  label: string
  total: number
}

/** Split a pack's binder into labelled groups. Null means a single grid. */
export function binderGroupsForPack(packId: string): BinderGroup[] | null {
  if (packId !== 'me55') return null
  return [
    { setId: 'me55', label: 'Main set', total: 161 },
    { setId: 'me55c', label: 'Classic Collection', total: 30 },
  ]
}

/** Set ids whose cards belong in this pack's binder. */
export function binderSetIds(setId: string): string[] {
  return [setId, ...(BINDER_COMPANION_SETS[setId] ?? [])]
}

/** Pokémon TCG API ids are `{setId}-{number}`; set ids may themselves contain dashes. */
export function setIdFromCardId(cardId: string): string {
  const i = cardId.lastIndexOf('-')
  return i > 0 ? cardId.slice(0, i) : cardId
}
