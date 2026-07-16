/** Compare two card numbers for binder-style ordering (numeric first, then locale). */
export function compareCardNumber(a: string, b: string): number {
  const an = parseInt(a, 10)
  const bn = parseInt(b, 10)
  if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn
  return a.localeCompare(b)
}

export function sortByCardNumber<T extends { number: string }>(cards: T[]): T[] {
  return [...cards].sort((a, b) => compareCardNumber(a.number, b.number))
}
