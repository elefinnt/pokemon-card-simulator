/**
 * First-copy detection for a freshly opened pack.
 *
 * Snapshot owned ids BEFORE merging the pack into the collection. A card is
 * "new" only the first time it appears; a second copy in the same pack is
 * already a duplicate.
 */

export function firstCopyIds(
  ownedIds: Iterable<string>,
  pulledIds: Iterable<string>,
): Set<string> {
  const seen = new Set(ownedIds)
  const first = new Set<string>()
  for (const id of pulledIds) {
    if (seen.has(id)) continue
    first.add(id)
    seen.add(id)
  }
  return first
}

/** True only for the first new occurrence of this card in the pack. */
export function isFirstCopyInPack(
  newCardIds: Set<string> | undefined,
  cards: { id: string }[],
  index: number,
): boolean {
  const card = cards[index]
  if (!card || !newCardIds?.has(card.id)) return false
  return cards.findIndex((c) => c.id === card.id) === index
}
