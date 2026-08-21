/**
 * Curated set catalogue and UI-only overrides.
 *
 * Set names, series, years and totals come from the Pokémon TCG API at runtime.
 * This file only lists which sets we offer and the visual copy the API lacks.
 * Offline fallback metadata lives in `lib/pack-fallback-meta.ts`.
 */

export interface PackOverride {
  /** Stable URL slug for the pack page, e.g. `/pack/pitch-black`. Never change
   *  a published slug — search engines and shared links depend on it. */
  slug: string
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
  'base5',
  'gym2',
  'neo1',
  'neo4',
  'ecard3',
  'ex7',
  'ex8',
  'g1',
  'xy12',
  'sm3',
  'sm35',
  'sm10',
  'sm115',
  'sm12',
  'swsh3',
  'swsh35',
  'swsh4',
  'swsh45',
  'swsh6',
  'swsh7',
  'cel25',
  'swsh8',
  'swsh9',
  'swsh10',
  'pgo',
  'swsh11',
  'swsh12',
  'swsh12pt5',
  'sv1',
  'sv2',
  'sv3',
  'sv3pt5',
  'sv4',
  'sv4pt5',
  'sv5',
  'sv6',
  'sv6pt5',
  'sv7',
  'sv8',
  'sv8pt5',
  'sv9',
  'sv10',
  'zsv10pt5',
  'rsv10pt5',
  'me1',
  'me2',
  'me2pt5',
  'me3',
  'me4',
  'me5',
] as const

export type CuratedSetId = (typeof CURATED_SET_IDS)[number]

export const PACK_OVERRIDES: Record<CuratedSetId, PackOverride> = {
  base1: {
    slug: 'base-set',
    accentFrom: '#3b82f6',
    accentTo: '#1e3a8a',
    blurb: 'Where it all began. Chase the iconic holo Charizard.',
  },
  base2: {
    slug: 'jungle',
    accentFrom: '#22c55e',
    accentTo: '#14532d',
    blurb: 'Wild Pokémon from deep in the jungle.',
  },
  base3: {
    slug: 'fossil',
    accentFrom: '#a16207',
    accentTo: '#451a03',
    blurb: 'Ancient Pokémon revived from fossils.',
  },
  base5: {
    slug: 'team-rocket',
    accentFrom: '#dc2626',
    accentTo: '#171717',
    blurb: 'Team Rocket takes over — chase the infamous Dark Charizard.',
  },
  gym2: {
    slug: 'gym-challenge',
    accentFrom: '#f97316',
    accentTo: '#7c2d12',
    blurb: 'Take on the toughest gym leaders — Blaine’s Charizard awaits.',
  },
  neo1: {
    slug: 'neo-genesis',
    accentFrom: '#38bdf8',
    accentTo: '#312e81',
    blurb: 'A new generation dawns — Lugia leads the Johto era.',
  },
  neo4: {
    slug: 'neo-destiny',
    accentFrom: '#e5e7eb',
    accentTo: '#374151',
    blurb: 'Shining Pokémon glitter in the rarest slots of the Neo era.',
  },
  ecard3: {
    slug: 'skyridge',
    accentFrom: '#0ea5e9',
    accentTo: '#0c4a6e',
    blurb: 'The legendary Skyridge — home of the coveted Crystal types.',
  },
  ex7: {
    slug: 'team-rocket-returns',
    accentFrom: '#991b1b',
    accentTo: '#111827',
    blurb: 'The Rockets are back — Dark Pokémon and Gold Star chase cards.',
  },
  ex8: {
    slug: 'deoxys',
    accentFrom: '#7c3aed',
    accentTo: '#0f172a',
    blurb: 'Deoxys descends — chase the Rocket-era ex cards and holo rares.',
  },
  g1: {
    slug: 'generations',
    accentFrom: '#ef4444',
    accentTo: '#1e40af',
    blurb: 'Twenty years of Pokémon — with the shining Radiant Collection.',
  },
  xy12: {
    slug: 'evolutions',
    accentFrom: '#f59e0b',
    accentTo: '#b91c1c',
    blurb: 'The Base Set reborn — classic artwork with modern foils.',
  },
  sm3: {
    slug: 'burning-shadows',
    accentFrom: '#f97316',
    accentTo: '#1c1917',
    blurb: 'Burning Shadows — Charizard GX smoulders among stunning full arts.',
  },
  sm35: {
    slug: 'shining-legends',
    accentFrom: '#fbbf24',
    accentTo: '#581c87',
    blurb: 'Shining Legends — Shining Pokémon return alongside Mewtwo GX.',
  },
  sm10: {
    slug: 'unbroken-bonds',
    accentFrom: '#f43f5e',
    accentTo: '#0f172a',
    blurb: 'Unbroken Bonds — Reshiram & Charizard GX headline the Tag Teams.',
  },
  sm115: {
    slug: 'hidden-fates',
    accentFrom: '#eab308',
    accentTo: '#78350f',
    blurb: 'Hidden Fates — the Shiny Vault and the legendary shiny Charizard GX.',
  },
  sm12: {
    slug: 'cosmic-eclipse',
    accentFrom: '#6366f1',
    accentTo: '#1e1b4b',
    blurb: 'Cosmic Eclipse — the Sun & Moon finale, packed with Tag Team hits.',
  },
  swsh3: {
    slug: 'darkness-ablaze',
    accentFrom: '#dc2626',
    accentTo: '#18181b',
    blurb: 'Darkness Ablaze — the Charizard VMAX everyone wants to pull.',
  },
  swsh35: {
    slug: 'champions-path',
    accentFrom: '#a855f7',
    accentTo: '#312e81',
    blurb: 'Champion’s Path — home of the coveted shiny Charizard V.',
  },
  swsh4: {
    slug: 'vivid-voltage',
    accentFrom: '#fbbf24',
    accentTo: '#1e3a8a',
    blurb: 'Vivid Voltage — Pikachu VMAX crackles amid the coveted Amazing Rares.',
  },
  swsh45: {
    slug: 'shining-fates',
    accentFrom: '#ec4899',
    accentTo: '#831843',
    blurb: 'A sea of Shiny Pokémon and dazzling foils.',
  },
  swsh6: {
    slug: 'chilling-reign',
    accentFrom: '#a5f3fc',
    accentTo: '#312e81',
    blurb: 'Chilling Reign — the Calyrex steeds and haunting alt-art cards.',
  },
  swsh7: {
    slug: 'evolving-skies',
    accentFrom: '#0ea5e9',
    accentTo: '#4c1d95',
    blurb: 'Dragons soar again — chase the coveted alt-art VMAX cards.',
  },
  cel25: {
    slug: 'celebrations',
    accentFrom: '#eab308',
    accentTo: '#713f12',
    blurb:
      'Twenty-five years of Pokémon — packed with iconic reprints and gold chase cards.',
  },
  swsh8: {
    slug: 'fusion-strike',
    accentFrom: '#e879f9',
    accentTo: '#4a044e',
    blurb: 'Fusion Strike — Mew VMAX and the spooky Gengar alt art.',
  },
  swsh9: {
    slug: 'brilliant-stars',
    accentFrom: '#f59e0b',
    accentTo: '#7c2d12',
    blurb: 'Brilliant Stars — Charizard VSTAR and the loved Trainer Gallery.',
  },
  swsh10: {
    slug: 'astral-radiance',
    accentFrom: '#67e8f9',
    accentTo: '#164e63',
    blurb: 'Astral Radiance — Origin Dialga and Palkia rule the Hisui era.',
  },
  pgo: {
    slug: 'pokemon-go',
    accentFrom: '#22d3ee',
    accentTo: '#1e3a8a',
    blurb: 'Pokémon GO — Radiant chase cards and a Ditto hiding in the commons.',
  },
  swsh11: {
    slug: 'lost-origin',
    accentFrom: '#c084fc',
    accentTo: '#1e1b4b',
    blurb: 'Lost Origin — the legendary Giratina VSTAR alt art lurks here.',
  },
  swsh12: {
    slug: 'silver-tempest',
    accentFrom: '#94a3b8',
    accentTo: '#0c4a6e',
    blurb: 'Silver Tempest — Lugia VSTAR and one of the great modern alt arts.',
  },
  swsh12pt5: {
    slug: 'crown-zenith',
    accentFrom: '#8b5cf6',
    accentTo: '#4c1d95',
    blurb:
      'The Galarian Gallery and stunning artwork make every pack a treasure.',
  },
  sv1: {
    slug: 'scarlet-and-violet',
    accentFrom: '#ef4444',
    accentTo: '#7c3aed',
    blurb: 'Scarlet & Violet begins — Koraidon, Miraidon and the first ex cards.',
  },
  sv2: {
    slug: 'paldea-evolved',
    accentFrom: '#34d399',
    accentTo: '#065f46',
    blurb: 'Paldea Evolved — the Paldean starters evolve into stunning exes.',
  },
  sv3: {
    slug: 'obsidian-flames',
    accentFrom: '#ea580c',
    accentTo: '#450a0a',
    blurb: 'Obsidian Flames — the Charizard ex blazes across every pack.',
  },
  sv3pt5: {
    slug: 'pokemon-151',
    accentFrom: '#f43f5e',
    accentTo: '#7f1d1d',
    blurb: 'The original 151, reimagined with modern chase cards.',
  },
  sv4: {
    slug: 'paradox-rift',
    accentFrom: '#a3e635',
    accentTo: '#4c1d95',
    blurb: 'Paradox Rift — Ancient and Future Pokémon tear through time.',
  },
  sv4pt5: {
    slug: 'paldean-fates',
    accentFrom: '#f472b6',
    accentTo: '#701a75',
    blurb: 'Paldean Fates — a Shiny Vault stuffed with baby shinies and ex hits.',
  },
  sv5: {
    slug: 'temporal-forces',
    accentFrom: '#2dd4bf',
    accentTo: '#134e4a',
    blurb: 'Temporal Forces — Walking Wake, Iron Leaves and paradox power.',
  },
  sv6: {
    slug: 'twilight-masquerade',
    accentFrom: '#c084fc',
    accentTo: '#3b0764',
    blurb: 'Twilight Masquerade — Ogerpon’s masks and gorgeous illustration rares.',
  },
  sv6pt5: {
    slug: 'shrouded-fable',
    accentFrom: '#a78bfa',
    accentTo: '#1e1b4b',
    blurb: 'Shrouded Fable — Pecharunt and the Loyal Three emerge from shadow.',
  },
  sv7: {
    slug: 'stellar-crown',
    accentFrom: '#facc15',
    accentTo: '#065f46',
    blurb: 'Stellar Crown — Terapagos shines above a field of stellar exes.',
  },
  sv8: {
    slug: 'surging-sparks',
    accentFrom: '#facc15',
    accentTo: '#1d4ed8',
    blurb: 'Surging Sparks — Pikachu ex leads a set crackling with energy.',
  },
  sv8pt5: {
    slug: 'prismatic-evolutions',
    accentFrom: '#a855f7',
    accentTo: '#ec4899',
    blurb: 'Prismatic Evolutions — chase the Eeveelution ex cards and radiant artwork.',
  },
  sv9: {
    slug: 'journey-together',
    accentFrom: '#06b6d4',
    accentTo: '#1e40af',
    blurb: 'Team up with partners old and new across Paldea and beyond.',
  },
  sv10: {
    slug: 'destined-rivals',
    accentFrom: '#ef4444',
    accentTo: '#581c87',
    blurb: 'Legendary rivals clash — hunt the Trainer Gallery and chase ex cards.',
  },
  zsv10pt5: {
    slug: 'black-bolt',
    accentFrom: '#171717',
    accentTo: '#2563eb',
    blurb: 'Black Bolt — Unova legends return with striking artwork and powerful ex.',
  },
  rsv10pt5: {
    slug: 'white-flare',
    accentFrom: '#f97316',
    accentTo: '#fef3c7',
    blurb: 'White Flare — Reshiram and friends light up every pack with fiery chase cards.',
  },
  me1: {
    slug: 'mega-evolution',
    accentFrom: '#6366f1',
    accentTo: '#701a75',
    blurb: 'Mega Evolution returns — Mega Lucario ex leads a brand-new era.',
  },
  me2: {
    slug: 'phantasmal-flames',
    accentFrom: '#f97316',
    accentTo: '#312e81',
    blurb: 'Phantasmal Flames — ghostly fire and fearsome Mega ex chase cards.',
  },
  me2pt5: {
    slug: 'ascended-heroes',
    accentFrom: '#f59e0b',
    accentTo: '#6d28d9',
    blurb:
      'Ascended Heroes — Mega Evolution Pokémon ex and Mega Attack Rares headline the biggest English set yet.',
  },
  me3: {
    slug: 'perfect-order',
    accentFrom: '#e5e7eb',
    accentTo: '#1e3a8a',
    blurb: 'Perfect Order — precision, power and pristine chase cards.',
  },
  me4: {
    slug: 'chaos-rising',
    accentFrom: '#dc2626',
    accentTo: '#0f172a',
    blurb: 'Chaos Rising — the Mega era erupts with wild, powerful pulls.',
  },
  me5: {
    slug: 'pitch-black',
    accentFrom: '#1e1b4b',
    accentTo: '#0f172a',
    blurb: 'Pitch Black — Mega Evolution returns, with shadowy chase cards lurking in every pack.',
  },
}

/** Set id for a published slug, or undefined if unknown. */
export function setIdForSlug(slug: string): CuratedSetId | undefined {
  return CURATED_SET_IDS.find((id) => PACK_OVERRIDES[id].slug === slug)
}
