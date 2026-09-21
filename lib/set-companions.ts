/**
 * Some packs pull cards from a subset that still belongs in the parent binder.
 * Real companion sets (Classic Collection, Trainer Gallery, Galarian Gallery)
 * are separate API pools. Generations' Radiant Collection is embedded in `g1`
 * (numbers RC1–RC32), so `g1rc` is a binder label only and is never fetched.
 */

export interface BinderGroup {
  setId: string
  label: string
  total: number
  /** Embedded subset of the parent API set, matched by number prefix. */
  numberPrefix?: string
}

const BINDER_GROUP_DEFS: Record<string, readonly BinderGroup[]> = {
  g1: [
    { setId: 'g1', label: 'Main set', total: 85 },
    {
      setId: 'g1rc',
      label: 'Radiant Collection',
      total: 32,
      numberPrefix: 'RC',
    },
  ],
  cel25: [
    { setId: 'cel25', label: 'Main set', total: 25 },
    { setId: 'cel25c', label: 'Classic Collection', total: 25 },
  ],
  swsh9: [
    { setId: 'swsh9', label: 'Main set', total: 186 },
    { setId: 'swsh9tg', label: 'Trainer Gallery', total: 30 },
  ],
  swsh10: [
    { setId: 'swsh10', label: 'Main set', total: 216 },
    { setId: 'swsh10tg', label: 'Trainer Gallery', total: 30 },
  ],
  swsh11: [
    { setId: 'swsh11', label: 'Main set', total: 217 },
    { setId: 'swsh11tg', label: 'Trainer Gallery', total: 30 },
  ],
  swsh12: [
    { setId: 'swsh12', label: 'Main set', total: 215 },
    { setId: 'swsh12tg', label: 'Trainer Gallery', total: 30 },
  ],
  swsh12pt5: [
    { setId: 'swsh12pt5', label: 'Main set', total: 160 },
    { setId: 'swsh12pt5gg', label: 'Galarian Gallery', total: 70 },
  ],
  me55: [
    { setId: 'me55', label: 'Main set', total: 161 },
    { setId: 'me55c', label: 'Classic Collection', total: 30 },
  ],
}

/** Fetchable companion API ids. Embedded prefixes such as `g1rc` are omitted. */
export const BINDER_COMPANION_SETS: Record<string, readonly string[]> =
  Object.fromEntries(
    Object.entries(BINDER_GROUP_DEFS)
      .map(([packId, groups]) => [
        packId,
        groups
          .filter((group) => group.setId !== packId && !group.numberPrefix)
          .map((group) => group.setId),
      ])
      .filter((entry) => entry[1].length > 0),
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

function numberToken(card: { id: string; number: string }): string {
  const number = card.number.trim()
  if (number) return number
  const dash = card.id.lastIndexOf('-')
  return dash >= 0 ? card.id.slice(dash + 1) : card.id
}

/** True when the card number is `{prefix}{digits…}`, e.g. RC1 or TG01. */
export function cardHasNumberPrefix(
  card: { id: string; number: string },
  prefix: string,
): boolean {
  const token = numberToken(card).toUpperCase()
  const normalised = prefix.toUpperCase()
  if (!token.startsWith(normalised)) return false
  return /^\d/.test(token.slice(normalised.length))
}

/**
 * Which binder group a card belongs to. Embedded subsets (Radiant Collection)
 * share the parent set id, so they are matched by number prefix. Real
 * companions keep their own set id.
 */
export function cardMatchesBinderGroup(
  card: { id: string; setId: string; number: string },
  group: BinderGroup,
  parentSetId: string,
): boolean {
  if (group.numberPrefix) {
    return (
      card.setId === parentSetId &&
      cardHasNumberPrefix(card, group.numberPrefix)
    )
  }

  if (group.setId === parentSetId) {
    if (card.setId !== parentSetId) return false
    const embedded = BINDER_GROUP_DEFS[parentSetId] ?? []
    return !embedded.some(
      (other) =>
        Boolean(other.numberPrefix) &&
        cardHasNumberPrefix(card, other.numberPrefix!),
    )
  }

  return card.setId === group.setId
}
