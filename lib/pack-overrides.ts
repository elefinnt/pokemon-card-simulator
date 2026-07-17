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
  'xy12',
  'cel25',
  'swsh45',
  'swsh7',
  'swsh12pt5',
  'sv3',
  'sv3pt5',
  'sv8',
  'sv8pt5',
  'sv9',
  'sv10',
  'zsv10pt5',
  'rsv10pt5',
  'me5',
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
  xy12: {
    accentFrom: '#f59e0b',
    accentTo: '#b91c1c',
    blurb: 'The Base Set reborn — classic artwork with modern foils.',
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
  swsh7: {
    accentFrom: '#0ea5e9',
    accentTo: '#4c1d95',
    blurb: 'Dragons soar again — chase the coveted alt-art VMAX cards.',
  },
  swsh12pt5: {
    accentFrom: '#8b5cf6',
    accentTo: '#4c1d95',
    blurb:
      'The Galarian Gallery and stunning artwork make every pack a treasure.',
  },
  sv3: {
    accentFrom: '#ea580c',
    accentTo: '#450a0a',
    blurb: 'Obsidian Flames — the Charizard ex blazes across every pack.',
  },
  sv3pt5: {
    accentFrom: '#f43f5e',
    accentTo: '#7f1d1d',
    blurb: 'The original 151, reimagined with modern chase cards.',
  },
  sv8: {
    accentFrom: '#facc15',
    accentTo: '#1d4ed8',
    blurb: 'Surging Sparks — Pikachu ex leads a set crackling with energy.',
  },
  sv8pt5: {
    accentFrom: '#a855f7',
    accentTo: '#ec4899',
    blurb: 'Prismatic Evolutions — chase the Eeveelution ex cards and radiant artwork.',
  },
  sv9: {
    accentFrom: '#06b6d4',
    accentTo: '#1e40af',
    blurb: 'Team up with partners old and new across Paldea and beyond.',
  },
  sv10: {
    accentFrom: '#ef4444',
    accentTo: '#581c87',
    blurb: 'Legendary rivals clash — hunt the Trainer Gallery and chase ex cards.',
  },
  zsv10pt5: {
    accentFrom: '#171717',
    accentTo: '#2563eb',
    blurb: 'Black Bolt — Unova legends return with striking artwork and powerful ex.',
  },
  rsv10pt5: {
    accentFrom: '#f97316',
    accentTo: '#fef3c7',
    blurb: 'White Flare — Reshiram and friends light up every pack with fiery chase cards.',
  },
  me5: {
    accentFrom: '#1e1b4b',
    accentTo: '#0f172a',
    blurb: 'Pitch Black — Mega Evolution returns, with shadowy chase cards lurking in every pack.',
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
  xy12: { name: 'Evolutions', series: 'XY', year: '2016', total: 113 },
  cel25: { name: 'Celebrations', series: 'Sword & Shield', year: '2021', total: 25 },
  swsh45: { name: 'Shining Fates', series: 'Sword & Shield', year: '2021', total: 73 },
  swsh7: { name: 'Evolving Skies', series: 'Sword & Shield', year: '2021', total: 237 },
  swsh12pt5: { name: 'Crown Zenith', series: 'Sword & Shield', year: '2023', total: 160 },
  sv3: { name: 'Obsidian Flames', series: 'Scarlet & Violet', year: '2023', total: 230 },
  sv3pt5: { name: '151', series: 'Scarlet & Violet', year: '2023', total: 207 },
  sv8: {
    name: 'Surging Sparks',
    series: 'Scarlet & Violet',
    year: '2024',
    total: 252,
  },
  sv8pt5: {
    name: 'Prismatic Evolutions',
    series: 'Scarlet & Violet',
    year: '2025',
    total: 180,
  },
  sv9: {
    name: 'Journey Together',
    series: 'Scarlet & Violet',
    year: '2025',
    total: 190,
  },
  sv10: {
    name: 'Destined Rivals',
    series: 'Scarlet & Violet',
    year: '2025',
    total: 244,
  },
  zsv10pt5: {
    name: 'Black Bolt',
    series: 'Scarlet & Violet',
    year: '2025',
    total: 172,
  },
  rsv10pt5: {
    name: 'White Flare',
    series: 'Scarlet & Violet',
    year: '2025',
    total: 173,
  },
  me5: {
    name: 'Pitch Black',
    series: 'Mega Evolution',
    year: '2026',
    total: 120,
  },
}
