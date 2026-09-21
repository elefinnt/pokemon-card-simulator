/** Reorder helpers for the profile showcase. Order is the array order saved
 *  in the existing JSON column; no schema change is required. */

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items
  }
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function addCardId(
  selected: string[],
  id: string,
  max: number,
  insertAt?: number,
): string[] {
  if (!id || selected.includes(id) || selected.length >= max) return selected
  if (insertAt == null || insertAt < 0 || insertAt > selected.length) {
    return [...selected, id]
  }
  const next = [...selected]
  next.splice(insertAt, 0, id)
  return next
}

export function removeCardId(selected: string[], id: string): string[] {
  return selected.filter((x) => x !== id)
}
