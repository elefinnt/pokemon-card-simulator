import { apiGet } from './client'
import { cached } from './cache'
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

async function fetchAllCardsForSet(setId: string): Promise<RawCard[]> {
  const cards: RawCard[] = []
  let page = 1

  for (;;) {
    const res = await apiGet<ApiListResponse<RawCard>>('/cards', {
      q: `set.id:${setId}`,
      page,
      pageSize: PAGE_SIZE,
      orderBy: 'number',
      select: POOL_FIELDS,
    })

    cards.push(...res.data)

    const reachedEnd =
      res.data.length < res.pageSize || cards.length >= res.totalCount
    if (reachedEnd) break
    page++
  }

  return cards
}

/** Cached card pool for a set — one API round-trip per set per day (per process). */
export function getCardsForSet(setId: string): Promise<RawCard[]> {
  return cached(`cards:${setId}`, () => fetchAllCardsForSet(setId))
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
