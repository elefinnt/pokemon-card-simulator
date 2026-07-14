/**
 * Curated set catalogue and UI-only overrides.
 *
 * Set names, series, years and totals come from the Pokémon TCG API at runtime.
 * This file only lists which sets we offer and the visual copy the API lacks.
 */

export interface PackOverride {
  accentFrom: string
  accentTo: string
  blurb: string
  packSize?: number
}

/** Sets available in the pack picker, in display order. */
export const CURATED_SET_IDS = [
  'base1',
  'base2',
  'base3',
  'cel25',
  'swsh45',
  'swsh12pt5',
  'sv3pt5',
] as const

export type CuratedSetId = (typeof CURATED_SET_IDS)[number]

export const PACK_OVERRIDES: Record<CuratedSetId, PackOverride> = {
  base1: {
    accentFrom: '#3b82f6',
    accentTo: '#1e3a8a',
    blurb: 'Where it all began. Chase the iconic holo Charizard.',
  },
  base2: {
    accentFrom: '#22c55e',
    accentTo: '#14532d',
    blurb: 'Wild Pokémon from deep in the jungle.',
  },
  base3: {
    accentFrom: '#a16207',
    accentTo: '#451a03',
    blurb: 'Ancient Pokémon revived from fossils.',
  },
  cel25: {
    accentFrom: '#eab308',
    accentTo: '#713f12',
    blurb:
      'Twenty-five years of Pokémon — packed with iconic reprints and gold chase cards.',
  },
  swsh45: {
    accentFrom: '#ec4899',
    accentTo: '#831843',
    blurb: 'A sea of Shiny Pokémon and dazzling foils.',
  },
  swsh12pt5: {
    accentFrom: '#8b5cf6',
    accentTo: '#4c1d95',
    blurb:
      'The Galarian Gallery and stunning artwork make every pack a treasure.',
  },
  sv3pt5: {
    accentFrom: '#f43f5e',
    accentTo: '#7f1d1d',
    blurb: 'The original 151, reimagined with modern chase cards.',
  },
}

/** Minimal fallback when the API is unreachable during pack catalogue build. */
export const FALLBACK_SET_META: Record<
  CuratedSetId,
  { name: string; series: string; year: string; total: number }
> = {
  base1: { name: 'Base', series: 'Base', year: '1999', total: 102 },
  base2: { name: 'Jungle', series: 'Base', year: '1999', total: 64 },
  base3: { name: 'Fossil', series: 'Base', year: '1999', total: 62 },
  cel25: { name: 'Celebrations', series: 'Sword & Shield', year: '2021', total: 25 },
  swsh45: { name: 'Shining Fates', series: 'Sword & Shield', year: '2021', total: 73 },
  swsh12pt5: { name: 'Crown Zenith', series: 'Sword & Shield', year: '2023', total: 160 },
  sv3pt5: { name: '151', series: 'Scarlet & Violet', year: '2023', total: 207 },
}
