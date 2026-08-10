/**
 * Minimal per-set fallback metadata, used when the Pokémon TCG API is
 * unreachable during pack catalogue build. Live names, series, years and
 * totals always come from the API when it responds.
 */

import type { CuratedSetId } from './pack-overrides'

export interface FallbackSetMeta {
  name: string
  series: string
  year: string
  total: number
}

export const FALLBACK_SET_META: Record<CuratedSetId, FallbackSetMeta> = {
  base1: { name: 'Base', series: 'Base', year: '1999', total: 102 },
  base2: { name: 'Jungle', series: 'Base', year: '1999', total: 64 },
  base3: { name: 'Fossil', series: 'Base', year: '1999', total: 62 },
  base5: { name: 'Team Rocket', series: 'Base', year: '2000', total: 83 },
  gym2: { name: 'Gym Challenge', series: 'Gym', year: '2000', total: 132 },
  neo1: { name: 'Neo Genesis', series: 'Neo', year: '2000', total: 111 },
  neo4: { name: 'Neo Destiny', series: 'Neo', year: '2002', total: 113 },
  ecard3: { name: 'Skyridge', series: 'E-Card', year: '2003', total: 182 },
  ex7: { name: 'Team Rocket Returns', series: 'EX', year: '2004', total: 111 },
  ex8: { name: 'Deoxys', series: 'EX', year: '2005', total: 108 },
  g1: { name: 'Generations', series: 'XY', year: '2016', total: 117 },
  xy12: { name: 'Evolutions', series: 'XY', year: '2016', total: 113 },
  sm3: { name: 'Burning Shadows', series: 'Sun & Moon', year: '2017', total: 177 },
  sm35: { name: 'Shining Legends', series: 'Sun & Moon', year: '2017', total: 81 },
  sm10: { name: 'Unbroken Bonds', series: 'Sun & Moon', year: '2019', total: 234 },
  sm115: { name: 'Hidden Fates', series: 'Sun & Moon', year: '2019', total: 69 },
  sm12: { name: 'Cosmic Eclipse', series: 'Sun & Moon', year: '2019', total: 272 },
  swsh3: { name: 'Darkness Ablaze', series: 'Sword & Shield', year: '2020', total: 201 },
  swsh35: { name: "Champion's Path", series: 'Sword & Shield', year: '2020', total: 80 },
  swsh4: { name: 'Vivid Voltage', series: 'Sword & Shield', year: '2020', total: 203 },
  swsh45: { name: 'Shining Fates', series: 'Sword & Shield', year: '2021', total: 73 },
  swsh6: { name: 'Chilling Reign', series: 'Sword & Shield', year: '2021', total: 233 },
  swsh7: { name: 'Evolving Skies', series: 'Sword & Shield', year: '2021', total: 237 },
  cel25: { name: 'Celebrations', series: 'Sword & Shield', year: '2021', total: 25 },
  swsh8: { name: 'Fusion Strike', series: 'Sword & Shield', year: '2021', total: 284 },
  swsh9: { name: 'Brilliant Stars', series: 'Sword & Shield', year: '2022', total: 186 },
  swsh10: { name: 'Astral Radiance', series: 'Sword & Shield', year: '2022', total: 216 },
  pgo: { name: 'Pokémon GO', series: 'Sword & Shield', year: '2022', total: 88 },
  swsh11: { name: 'Lost Origin', series: 'Sword & Shield', year: '2022', total: 217 },
  swsh12: { name: 'Silver Tempest', series: 'Sword & Shield', year: '2022', total: 215 },
  swsh12pt5: { name: 'Crown Zenith', series: 'Sword & Shield', year: '2023', total: 160 },
  sv1: { name: 'Scarlet & Violet', series: 'Scarlet & Violet', year: '2023', total: 258 },
  sv2: { name: 'Paldea Evolved', series: 'Scarlet & Violet', year: '2023', total: 279 },
  sv3: { name: 'Obsidian Flames', series: 'Scarlet & Violet', year: '2023', total: 230 },
  sv3pt5: { name: '151', series: 'Scarlet & Violet', year: '2023', total: 207 },
  sv4: { name: 'Paradox Rift', series: 'Scarlet & Violet', year: '2023', total: 266 },
  sv4pt5: { name: 'Paldean Fates', series: 'Scarlet & Violet', year: '2024', total: 245 },
  sv5: { name: 'Temporal Forces', series: 'Scarlet & Violet', year: '2024', total: 218 },
  sv6: { name: 'Twilight Masquerade', series: 'Scarlet & Violet', year: '2024', total: 226 },
  sv6pt5: { name: 'Shrouded Fable', series: 'Scarlet & Violet', year: '2024', total: 99 },
  sv7: { name: 'Stellar Crown', series: 'Scarlet & Violet', year: '2024', total: 175 },
  sv8: { name: 'Surging Sparks', series: 'Scarlet & Violet', year: '2024', total: 252 },
  sv8pt5: { name: 'Prismatic Evolutions', series: 'Scarlet & Violet', year: '2025', total: 180 },
  sv9: { name: 'Journey Together', series: 'Scarlet & Violet', year: '2025', total: 190 },
  sv10: { name: 'Destined Rivals', series: 'Scarlet & Violet', year: '2025', total: 244 },
  zsv10pt5: { name: 'Black Bolt', series: 'Scarlet & Violet', year: '2025', total: 172 },
  rsv10pt5: { name: 'White Flare', series: 'Scarlet & Violet', year: '2025', total: 173 },
  me1: { name: 'Mega Evolution', series: 'Mega Evolution', year: '2025', total: 188 },
  me2: { name: 'Phantasmal Flames', series: 'Mega Evolution', year: '2025', total: 130 },
  me3: { name: 'Perfect Order', series: 'Mega Evolution', year: '2026', total: 124 },
  me4: { name: 'Chaos Rising', series: 'Mega Evolution', year: '2026', total: 122 },
  me5: { name: 'Pitch Black', series: 'Mega Evolution', year: '2026', total: 120 },
}
