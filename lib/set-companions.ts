/**
 * Some packs pull cards from a companion subset that still belongs in the
 * parent binder. 30th Celebration can hit Classic Collection reprints, and
 * Crown Zenith packs can hit Galarian Gallery cards, so those count toward
 * the parent set's completion.
 */

export interface BinderGroup {
  setId: string
  label: string
  total: number
}

const BINDER_GROUP_DEFS: Record<string, readonly BinderGroup[]> = {
  me55: [
    { setId: 'me55', label: 'Main set', total: 161 },
    { setId: 'me55c', label: 'Classic Collection', total: 30 },
  ],
  swsh12pt5: [
    { setId: 'swsh12pt5', label: 'Main set', total: 160 },
    { setId: 'swsh12pt5gg', label: 'Galarian Gallery', total: 70 },
  ],
}

export const BINDER_COMPANION_SETS: Record<string, readonly string[]> =
  Object.fromEntries(
    Object.entries(BINDER_GROUP_DEFS).map(([packId, groups]) => [
      packId,
      groups.filter((group) => group.setId !== packId).map((group) => group.setId),
    ]),
  )

/** Split a pack's binder into labelled groups. Null means a single grid. */
export function binderGroupsForPack(packId: string): BinderGroup[] | null {
  const groups = BINDER_GROUP_DEFS[packId]
  return groups ? [...groups] : null
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
