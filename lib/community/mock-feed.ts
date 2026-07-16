import type { CardTier } from '@/lib/pokemon'
import type { FeedEvent, ReactionKey } from './types'

/**
 * A hand-built, static feed shown to signed-out visitors. It uses real card
 * artwork from the Pokémon TCG image CDN so the preview looks like the genuine
 * article, while nudging the visitor to sign in and see their friends for real.
 *
 * Nothing here touches the database — it's purely a marketing/onboarding
 * surface. Reactions are illustrative only.
 */

interface MockCardInput {
  setId: string
  number: number
  name: string
  rarity: string
  tier: CardTier
  foil?: boolean
  rainbow?: boolean
}

function mockCard(input: MockCardInput) {
  const base = `https://images.pokemontcg.io/${input.setId}/${input.number}`
  return {
    id: `${input.setId}-${input.number}`,
    name: input.name,
    number: String(input.number),
    rarity: input.rarity,
    supertype: 'Pokémon',
    types: [] as string[],
    imageSmall: `${base}.png`,
    imageLarge: `${base}_hires.png`,
    artist: null,
    tier: input.tier,
    foil: input.foil ?? false,
    rainbow: input.rainbow ?? false,
  }
}

function reactions(
  counts: Partial<Record<ReactionKey, number>>,
): Record<ReactionKey, number> {
  return {
    fire: counts.fire ?? 0,
    love: counts.love ?? 0,
    wow: counts.wow ?? 0,
    haha: counts.haha ?? 0,
  }
}

export const MOCK_FEED_EVENTS: FeedEvent[] = [
  {
    id: -1,
    user: { id: 'mock-mia', name: 'Mia', image: null },
    packId: 'base1',
    packName: 'Base',
    series: 'Base',
    minutesAgo: 4,
    bestTier: 'ultra',
    reactions: reactions({ fire: 18, love: 7, wow: 4 }),
    myReaction: null,
    cards: [
      mockCard({ setId: 'base1', number: 4, name: 'Charizard', rarity: 'Rare Holo', tier: 'ultra', foil: true }),
      mockCard({ setId: 'base1', number: 58, name: 'Pikachu', rarity: 'Common', tier: 'common' }),
      mockCard({ setId: 'base1', number: 46, name: 'Charmander', rarity: 'Common', tier: 'common' }),
      mockCard({ setId: 'base1', number: 24, name: 'Charmeleon', rarity: 'Uncommon', tier: 'uncommon' }),
      mockCard({ setId: 'base1', number: 63, name: 'Squirtle', rarity: 'Common', tier: 'common' }),
    ],
  },
  {
    id: -2,
    user: { id: 'mock-diego', name: 'Diego', image: null },
    packId: 'base3',
    packName: 'Fossil',
    series: 'Base',
    minutesAgo: 12,
    bestTier: 'rare',
    reactions: reactions({ fire: 9, wow: 11, haha: 2 }),
    myReaction: null,
    cards: [
      mockCard({ setId: 'base3', number: 4, name: 'Dragonite', rarity: 'Rare Holo', tier: 'rare', foil: true }),
      mockCard({ setId: 'base3', number: 3, name: 'Ditto', rarity: 'Rare Holo', tier: 'rare', foil: true }),
      mockCard({ setId: 'base3', number: 11, name: 'Magneton', rarity: 'Rare Holo', tier: 'uncommon' }),
      mockCard({ setId: 'base3', number: 15, name: 'Zapdos', rarity: 'Rare Holo', tier: 'rare', foil: true }),
    ],
  },
  {
    id: -3,
    user: { id: 'mock-yuki', name: 'Yuki', image: null },
    packId: 'base2',
    packName: 'Jungle',
    series: 'Base',
    minutesAgo: 23,
    bestTier: 'rare',
    reactions: reactions({ love: 14, fire: 6 }),
    myReaction: null,
    cards: [
      mockCard({ setId: 'base2', number: 11, name: 'Snorlax', rarity: 'Rare Holo', tier: 'rare', foil: true }),
      mockCard({ setId: 'base2', number: 10, name: 'Scyther', rarity: 'Rare Holo', tier: 'rare', foil: true }),
      mockCard({ setId: 'base2', number: 51, name: 'Eevee', rarity: 'Common', tier: 'common' }),
      mockCard({ setId: 'base2', number: 56, name: 'Meowth', rarity: 'Common', tier: 'common' }),
    ],
  },
  {
    id: -4,
    user: { id: 'mock-leon', name: 'Leon', image: null },
    packId: 'xy12',
    packName: 'Evolutions',
    series: 'XY',
    minutesAgo: 38,
    bestTier: 'ultra',
    reactions: reactions({ fire: 27, love: 12, wow: 8, haha: 1 }),
    myReaction: null,
    cards: [
      mockCard({ setId: 'xy12', number: 11, name: 'Charizard', rarity: 'Rare Holo', tier: 'ultra', foil: true }),
      mockCard({ setId: 'xy12', number: 1, name: 'Venusaur', rarity: 'Rare Holo', tier: 'rare', foil: true }),
      mockCard({ setId: 'xy12', number: 9, name: 'Charmander', rarity: 'Common', tier: 'common' }),
      mockCard({ setId: 'xy12', number: 22, name: 'Squirtle', rarity: 'Common', tier: 'common' }),
      mockCard({ setId: 'xy12', number: 35, name: 'Pikachu', rarity: 'Common', tier: 'common' }),
    ],
  },
]
