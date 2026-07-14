/**
 * Raw response shapes from the Pokémon TCG API v2 (https://docs.pokemontcg.io).
 */

export interface ApiListResponse<T> {
  data: T[]
  page: number
  pageSize: number
  count: number
  totalCount: number
}

export interface ApiErrorResponse {
  error: {
    message: string
    code: number
  }
}

export interface RawCardImages {
  small?: string
  large?: string
}

export interface RawAttack {
  name: string
  cost?: string[]
  convertedEnergyCost?: number
  damage?: string
  text?: string
}

export interface RawAbility {
  name: string
  text: string
  type?: string
}

export interface RawTypeValue {
  type: string
  value: string
}

export interface RawCard {
  id: string
  name: string
  number?: string
  rarity?: string
  supertype?: string
  subtypes?: string[]
  types?: string[]
  artist?: string
  images?: RawCardImages
  hp?: string
  flavorText?: string
  evolvesFrom?: string
  attacks?: RawAttack[]
  abilities?: RawAbility[]
  weaknesses?: RawTypeValue[]
  resistances?: RawTypeValue[]
  retreatCost?: string[]
  convertedRetreatCost?: number
}

export interface RawSet {
  id: string
  name: string
  series: string
  printedTotal?: number
  total?: number
  releaseDate?: string
  images?: {
    symbol?: string
    logo?: string
  }
}

/** Card detail payload returned to the client for the detail modal. */
export interface CardDetail {
  id: string
  name: string
  number: string
  rarity: string
  supertype: string
  subtypes: string[]
  types: string[]
  artist: string | null
  hp: string | null
  flavorText: string | null
  evolvesFrom: string | null
  attacks: RawAttack[]
  abilities: RawAbility[]
  weaknesses: RawTypeValue[]
  resistances: RawTypeValue[]
  retreatCost: string[]
  convertedRetreatCost: number | null
  imageSmall: string
  imageLarge: string
}
