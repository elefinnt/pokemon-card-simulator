'use client'

import type { PackDef } from '@/lib/packs'
import type { CardTier, PokemonCard } from '@/lib/pokemon'
import type { FeedEvent, ReactionKey } from './types'
import { MOCK_FEED_EVENTS } from './mock-feed'

/**
 * Generated "global" feed events. Until the real player base is large enough
 * to fill a worldwide feed, the global scope mixes the viewer's own openings
 * with randomised mock activity. Cards are sampled from the real set
 * catalogues, so the artwork and rarities are genuine — only the trainers
 * are invented.
 */

const NAME_POOL = [
  'Sofia',
  'Arjun',
  'Chloe',
  'Marcus',
  'Hana',
  'Felix',
  'Isla',
  'Noah',
  'Priya',
  'Oscar',
  'Emre',
  'Lena',
  'Kai',
  'Ruby',
  'Mateo',
  'Zoe',
  'Finn',
  'Amara',
  'Jonas',
  'Tilly',
]

const TIER_RANK: Record<CardTier, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  ultra: 3,
}

/** Chance a mock pack's hit slot rolls an ultra. Deliberately juicier than
 *  real odds so the global feed looks like a busy site's highlight reel. */
const MOCK_ULTRA_CHANCE = 0.4

function randInt(max: number): number {
  return Math.floor(Math.random() * max)
}

function shuffle<T>(input: readonly T[]): T[] {
  const out = [...input]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

async function fetchCatalogue(setId: string): Promise<PokemonCard[] | null> {
  try {
    const res = await fetch(`/api/sets/${setId}/cards`)
    if (!res.ok) return null
    const data = (await res.json()) as { cards: PokemonCard[] }
    return data.cards.length > 0 ? data.cards : null
  } catch {
    return null
  }
}

/** Draw `count` random cards from `primary`, falling back when it's empty. */
function draw(
  count: number,
  primary: PokemonCard[],
  ...fallbacks: PokemonCard[][]
): PokemonCard[] {
  const sources = [primary, ...fallbacks].filter((s) => s.length > 0)
  if (sources.length === 0) return []
  const out: PokemonCard[] = []
  for (let i = 0; i < count; i++) {
    const source = sources[0]
    out.push(source[randInt(source.length)])
  }
  return out
}

/** Assemble a plausible booster line-up from a set catalogue, mirroring the
 *  common/uncommon/hit structure of a real pack. */
function buildMockPackCards(
  catalogue: PokemonCard[],
  packSize: number,
): PokemonCard[] {
  const byTier: Record<CardTier, PokemonCard[]> = {
    common: [],
    uncommon: [],
    rare: [],
    ultra: [],
  }
  for (const card of catalogue) byTier[card.tier].push(card)

  const cards: PokemonCard[] = []
  cards.push(
    ...draw(Math.max(1, packSize - 4), byTier.common, byTier.uncommon),
  )
  cards.push(...draw(3, byTier.uncommon, byTier.common))

  const wantUltra = byTier.ultra.length > 0 && Math.random() < MOCK_ULTRA_CHANCE
  const hit = wantUltra
    ? draw(1, byTier.ultra)[0]
    : draw(1, byTier.rare, byTier.ultra, byTier.uncommon, byTier.common)[0]
  if (hit) cards.push(hit)

  return cards
}

function bestTierOf(cards: PokemonCard[]): CardTier {
  return cards.reduce<CardTier>(
    (best, c) => (TIER_RANK[c.tier] > TIER_RANK[best] ? c.tier : best),
    'common',
  )
}

/** Reaction counts weighted by how exciting the pull was. */
function mockReactions(bestTier: CardTier): Record<ReactionKey, number> {
  const heat = bestTier === 'ultra' ? 3 : bestTier === 'rare' ? 1 : 0
  return {
    fire: randInt(6 + heat * 8),
    love: randInt(4 + heat * 4),
    wow: randInt(3 + heat * 3),
    haha: randInt(2),
  }
}

async function generateGlobalEvents(
  packs: PackDef[],
  count = 8,
): Promise<FeedEvent[]> {
  if (packs.length === 0) return []

  // Sample a handful of sets so we only fetch a few catalogues per visit.
  const chosenPacks = shuffle(packs).slice(0, 3)
  const catalogues = await Promise.all(
    chosenPacks.map(async (pack) => ({
      pack,
      cards: await fetchCatalogue(pack.id),
    })),
  )
  const usable = catalogues.filter(
    (c): c is { pack: PackDef; cards: PokemonCard[] } => c.cards !== null,
  )
  if (usable.length === 0) return []

  const names = shuffle(NAME_POOL).slice(0, count)
  const events = names.map((name, i): FeedEvent => {
    const { pack, cards: catalogue } = usable[randInt(usable.length)]
    const cards = buildMockPackCards(catalogue, pack.packSize)
    const bestTier = bestTierOf(cards)
    return {
      // Negative ids keep mock events distinct from real DB-backed openings.
      id: -(101 + i),
      user: { id: `mock-global-${i}`, name, image: null },
      packId: pack.id,
      packName: pack.name,
      series: pack.series,
      minutesAgo: 1 + randInt(58),
      cards,
      bestTier,
      reactions: mockReactions(bestTier),
      myReaction: null,
    }
  })

  return events.sort((a, b) => a.minutesAgo - b.minutesAgo)
}

// Cache for the visit so switching tabs doesn't reshuffle the feed. A fresh
// page load generates a new batch, keeping the "global" activity feeling live.
let cache: FeedEvent[] | null = null

export async function getGlobalFeedEvents(
  packs: PackDef[],
): Promise<FeedEvent[]> {
  if (cache && cache.length > 0) return cache
  const generated = await generateGlobalEvents(packs)
  // Fall back to the hand-written preview if the catalogues are unreachable.
  cache = generated.length > 0 ? generated : MOCK_FEED_EVENTS
  return cache
}

/** Persist locally-applied reactions so they survive tab switches. */
export function setCachedGlobalEvents(events: FeedEvent[]): void {
  cache = events
}
