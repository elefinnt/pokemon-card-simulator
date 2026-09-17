/** Compare two card numbers for binder-style ordering (numeric first, then locale). */
const RGB_ORDER: Record<string, number> = { R: 1, G: 2, B: 3 }

export function compareCardNumber(a: string, b: string): number {
  const ar = RGB_ORDER[a]
  const br = RGB_ORDER[b]
  if (ar && br) return ar - br
  if (ar) return 1
  if (br) return -1

  const an = parseInt(a, 10)
  const bn = parseInt(b, 10)
  if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn
  return a.localeCompare(b)
}

export function sortByCardNumber<T extends { number: string }>(cards: T[]): T[] {
  return [...cards].sort((a, b) => compareCardNumber(a.number, b.number))
}
