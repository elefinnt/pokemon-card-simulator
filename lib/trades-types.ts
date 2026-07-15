import type { CardTier } from './pokemon'

export const TRADE_MESSAGE_MAX_LENGTH = 280
/** Guard rails so a single offer can't balloon unreasonably. */
export const TRADE_MAX_ITEM_TYPES_PER_SIDE = 60
export const TRADE_MAX_QUANTITY_PER_ITEM = 99

export type TradeSide = 'from' | 'to'

export type TradeStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'countered'

export type TradeResponseAction = 'accept' | 'decline' | 'cancel'

/** A minimal profile for the two parties of a trade. */
export interface TradeParty {
  id: string
  name: string | null
  image: string | null
}

/** A single card line on one side of an offer (with denormalised snapshot). */
export interface TradeItem {
  cardId: string
  quantity: number
  setId: string
  name: string
  number: string
  rarity: string
  tier: CardTier
  foil: boolean
  rainbow: boolean
  imageSmall: string
  imageLarge: string
}

/** What the client sends when composing an offer; the server snapshots meta. */
export interface TradeItemInput {
  cardId: string
  quantity: number
}

/** A full offer as returned to the client. */
export interface TradeOffer {
  id: number
  status: TradeStatus
  message: string | null
  replacesId: number | null
  createdAt: number
  respondedAt: number | null
  /** True when the signed-in viewer composed this offer. */
  outgoing: boolean
  from: TradeParty
  to: TradeParty
  /** Cards the sender (`from`) is giving. */
  fromItems: TradeItem[]
  /** Cards requested from the recipient (`to`). */
  toItems: TradeItem[]
}

/** Payload the client sends to create (or counter) an offer. */
export interface CreateTradeInput {
  toUserId: string
  fromItems: TradeItemInput[]
  toItems: TradeItemInput[]
  message?: string | null
  /** When set, this offer supersedes an existing one (a counter-offer). */
  replacesId?: number | null
}

/** Everything the Friends tab needs to render trade state. */
export interface TradeOverview {
  incoming: TradeOffer[]
  outgoing: TradeOffer[]
  /** Count of pending incoming offers keyed by the sender's user id. */
  pendingByFriend: Record<string, number>
  /** Total pending incoming offers (drives the Friends tab badge). */
  incomingCount: number
}

export function emptyTradeOverview(): TradeOverview {
  return { incoming: [], outgoing: [], pendingByFriend: {}, incomingCount: 0 }
}

export function isTradeResponseAction(
  value: unknown,
): value is TradeResponseAction {
  return value === 'accept' || value === 'decline' || value === 'cancel'
}

/**
 * Validate and clamp a list of client-supplied item inputs. Merges duplicate
 * card ids, drops non-positive quantities, and enforces the per-side limits.
 * Returns null when the input shape is invalid.
 */
export function sanitiseItemInputs(
  value: unknown,
): TradeItemInput[] | null {
  if (!Array.isArray(value)) return null

  const byCard = new Map<string, number>()
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null
    const cardId = (raw as { cardId?: unknown }).cardId
    const quantity = (raw as { quantity?: unknown }).quantity
    if (typeof cardId !== 'string' || cardId.length === 0) return null
    if (typeof quantity !== 'number' || !Number.isFinite(quantity)) return null

    const qty = Math.min(
      TRADE_MAX_QUANTITY_PER_ITEM,
      Math.max(0, Math.floor(quantity)),
    )
    if (qty <= 0) continue
    byCard.set(cardId, Math.min(TRADE_MAX_QUANTITY_PER_ITEM, qty))
  }

  const items = [...byCard.entries()].map(([cardId, quantity]) => ({
    cardId,
    quantity,
  }))

  if (items.length > TRADE_MAX_ITEM_TYPES_PER_SIDE) return null
  return items
}

export function sanitiseMessage(value: unknown): string | null {
  if (value == null) return null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  return trimmed.slice(0, TRADE_MESSAGE_MAX_LENGTH)
}

/** Total number of individual cards across both sides of an offer. */
export function totalItemCount(offer: TradeOffer): number {
  const sum = (items: TradeItem[]) =>
    items.reduce((n, item) => n + item.quantity, 0)
  return sum(offer.fromItems) + sum(offer.toItems)
}
