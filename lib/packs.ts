export interface PackDef {
  /** Pokémon TCG API set id */
  id: string
  name: string
  series: string
  year: string
  /** Number of cards per booster */
  packSize: number
  /** Accent color used for the pack art gradient (hex) */
  accentFrom: string
  accentTo: string
  blurb: string
}

/**
 * A small, curated selection of booster packs for the MVP.
 * Each `id` maps to a real set on the Pokémon TCG API (pokemontcg.io),
 * and the logo art is loaded from images.pokemontcg.io/<id>/logo.png.
 */
export const PACKS: PackDef[] = [
  {
    id: 'base1',
    name: 'Base Set',
    series: 'Original',
    year: '1999',
    packSize: 10,
    accentFrom: '#3b82f6',
    accentTo: '#1e3a8a',
    blurb: 'Where it all began. Chase the iconic holo Charizard.',
  },
  {
    id: 'base2',
    name: 'Jungle',
    series: 'Original',
    year: '1999',
    packSize: 10,
    accentFrom: '#22c55e',
    accentTo: '#14532d',
    blurb: 'Wild Pokémon from deep in the jungle.',
  },
  {
    id: 'base3',
    name: 'Fossil',
    series: 'Original',
    year: '1999',
    packSize: 10,
    accentFrom: '#a16207',
    accentTo: '#451a03',
    blurb: 'Ancient Pokémon revived from fossils.',
  },
  {
    id: 'swsh45',
    name: 'Shining Fates',
    series: 'Sword & Shield',
    year: '2021',
    packSize: 10,
    accentFrom: '#ec4899',
    accentTo: '#831843',
    blurb: 'A sea of Shiny Pokémon and dazzling foils.',
  },
  {
    id: 'sv3pt5',
    name: '151',
    series: 'Scarlet & Violet',
    year: '2023',
    packSize: 10,
    accentFrom: '#f43f5e',
    accentTo: '#7f1d1d',
    blurb: 'The original 151, reimagined with modern chase cards.',
  },
]

export function getPack(id: string): PackDef | undefined {
  return PACKS.find((p) => p.id === id)
}

export function packLogo(id: string): string {
  return `https://images.pokemontcg.io/${id}/logo.png`
}

export function packSymbol(id: string): string {
  return `https://images.pokemontcg.io/${id}/symbol.png`
}
