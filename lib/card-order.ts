/** Compare two card numbers for binder-style ordering (numeric first, then locale). */
const RGB_ORDER: Record<string, number> = { R: 1, G: 2, B: 3 }

interface SplitNumber {
  prefix: string
  num: number | null
  suffix: string
}

/** `RC10` → RC / 10, `TG01` → TG / 1, `12` → "" / 12. Letters without digits stay whole. */
function splitCardNumber(value: string): SplitNumber {
  const match = /^([A-Za-z]*)(\d+)(.*)$/.exec(value)
  if (!match) return { prefix: value, num: null, suffix: '' }
  return {
    prefix: match[1].toUpperCase(),
    num: parseInt(match[2], 10),
    suffix: match[3],
  }
}

export function compareCardNumber(a: string, b: string): number {
  const ar = RGB_ORDER[a]
  const br = RGB_ORDER[b]
  if (ar && br) return ar - br
  if (ar) return 1
  if (br) return -1

  const left = splitCardNumber(a)
  const right = splitCardNumber(b)
  if (left.num !== null && right.num !== null) {
    const prefix = left.prefix.localeCompare(right.prefix)
    if (prefix !== 0) return prefix
    if (left.num !== right.num) return left.num - right.num
    return left.suffix.localeCompare(right.suffix)
  }
  if (left.num !== null) return -1
  if (right.num !== null) return 1
  return a.localeCompare(b)
}

export function sortByCardNumber<T extends { number: string }>(cards: T[]): T[] {
  return [...cards].sort((a, b) => compareCardNumber(a.number, b.number))
}
