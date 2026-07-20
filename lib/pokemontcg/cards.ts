import { apiGet } from './client'
import { cached } from './cache'
import { getSnapshotForSet } from './snapshot'
import type { ApiListResponse, CardDetail, RawCard } from './types'

const POOL_FIELDS =
  'id,name,number,rarity,supertype,subtypes,types,artist,images'

const DETAIL_FIELDS = [
  'id',
  'name',
  'number',
  'rarity',
  'supertype',
  'subtypes',
  'types',
  'artist',
  'images',
  'hp',
  'flavorText',
  'evolvesFrom',
  'attacks',
  'abilities',
  'weaknesses',
  'resistances',
  'retreatCost',
  'convertedRetreatCost',
].join(',')

const PAGE_SIZE = 250

function fetchCardsPage(setId: string, page: number) {
  return apiGet<ApiListResponse<RawCard>>('/cards', {
    q: `set.id:${setId}`,
    page,
    pageSize: PAGE_SIZE,
    orderBy: 'number',
    select: POOL_FIELDS,
  })
}

async function fetchAllCardsForSet(setId: string): Promise<RawCard[]> {
  const first = await fetchCardsPage(setId, 1)
  const cards = [...first.data]

  // Page 1 tells us the total, so fetch any remaining pages in parallel rather
  // than walking them one slow round-trip at a time.
  const pageCount = Math.ceil(first.totalCount / (first.pageSize || PAGE_SIZE))
  if (pageCount > 1) {
    const rest = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, i) =>
        fetchCardsPage(setId, i + 2),
      ),
    )
    for (const res of rest) cards.push(...res.data)
  }

  return cards
}

/**
 * Cached card pool for a set. A cold cache is seeded instantly from the
 * committed snapshot (see `snapshot.ts`) and refreshed from the API in the
 * background, so the first open of a set never blocks on the external API.
 */
export function getCardsForSet(setId: string): Promise<RawCard[]> {
  return cached(`cards:${setId}`, () => fetchAllCardsForSet(setId), {
    seed: () => getSnapshotForSet(setId),
  })
}

function toCardDetail(raw: RawCard): CardDetail {
  return {
    id: raw.id,
    name: raw.name,
    number: raw.number ?? '',
    rarity: raw.rarity ?? 'Common',
    supertype: raw.supertype ?? 'Pokémon',
    subtypes: raw.subtypes ?? [],
    types: raw.types ?? [],
    artist: raw.artist ?? null,
    hp: raw.hp ?? null,
    flavorText: raw.flavorText ?? null,
    evolvesFrom: raw.evolvesFrom ?? null,
    attacks: raw.attacks ?? [],
    abilities: raw.abilities ?? [],
    weaknesses: raw.weaknesses ?? [],
    resistances: raw.resistances ?? [],
    retreatCost: raw.retreatCost ?? [],
    convertedRetreatCost: raw.convertedRetreatCost ?? null,
    imageSmall: raw.images?.small ?? '',
    imageLarge: raw.images?.large ?? raw.images?.small ?? '',
  }
}

async function fetchCardById(cardId: string): Promise<CardDetail> {
  const res = await apiGet<{ data: RawCard }>(`/cards/${cardId}`, {
    select: DETAIL_FIELDS,
  })
  return toCardDetail(res.data)
}

/** Full card detail for the collection modal (cached for 24 h). */
export function getCardById(cardId: string): Promise<CardDetail> {
  return cached(`card:${cardId}`, () => fetchCardById(cardId))
}
