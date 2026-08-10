/**
 * Synthetic site-wide stats for the landing page's social-proof section.
 *
 * The figures are derived purely from the clock, so they grow steadily over
 * time, every visitor sees the same numbers, and no database counter is
 * needed. They are marketing copy, not real telemetry — tune the bases and
 * daily rates below as the real audience grows.
 */

/** The moment the counters start growing from their base values. */
const EPOCH_MS = Date.UTC(2026, 7, 1) // 1 August 2026

const BASE = {
  collectors: 9_470,
  packsOpened: 236_500,
  cardsPulled: 2_215_000,
}

/** Growth per day. Packs tick roughly once every 30 seconds, which makes the
 *  live counter visibly move while a visitor reads the page. */
const PER_DAY = {
  collectors: 36,
  packsOpened: 2_750,
  cardsPulled: 25_850,
}

export interface SiteStats {
  collectors: number
  packsOpened: number
  cardsPulled: number
}

export function getSiteStats(now: number = Date.now()): SiteStats {
  const days = Math.max(0, (now - EPOCH_MS) / 86_400_000)
  return {
    collectors: Math.floor(BASE.collectors + PER_DAY.collectors * days),
    packsOpened: Math.floor(BASE.packsOpened + PER_DAY.packsOpened * days),
    cardsPulled: Math.floor(BASE.cardsPulled + PER_DAY.cardsPulled * days),
  }
}

/** Round down to a marketing-friendly step, e.g. 9,873 -> 9,800 for "9,800+". */
export function roundDownTo(value: number, step: number): number {
  return Math.floor(value / step) * step
}
