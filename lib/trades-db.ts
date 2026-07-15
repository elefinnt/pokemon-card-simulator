import { and, eq, gte, inArray, lte, or, sql } from 'drizzle-orm'
import { requireDb } from '@/db'
import { collectedCards, tradeOffers, tradeOfferItems, users } from '@/db/schema'
import { assertFriends } from './friends-db'
import { getUserCollection } from './collection-db'
import type { CardTier } from './pokemon'
import {
  type CreateTradeInput,
  type TradeItem,
  type TradeItemInput,
  type TradeOffer,
  type TradeOverview,
  type TradeParty,
  type TradeResponseAction,
  type TradeSide,
  emptyTradeOverview,
} from './trades-types'

/** Error with an HTTP status so route handlers can map it directly. */
export class TradeError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = 'TradeError'
    this.status = status
  }
}

type OfferRow = typeof tradeOffers.$inferSelect
type ItemRow = typeof tradeOfferItems.$inferSelect

function rowToItem(row: ItemRow): TradeItem {
  return {
    cardId: row.cardId,
    quantity: row.quantity,
    setId: row.setId,
    name: row.name,
    number: row.number,
    rarity: row.rarity,
    tier: row.tier as CardTier,
    foil: row.foil,
    rainbow: row.rainbow,
    imageSmall: row.imageSmall,
    imageLarge: row.imageLarge,
  }
}

/** Build the DB values for an item, snapshotting metadata from a collection. */
function itemValues(
  offerId: number,
  side: TradeSide,
  input: TradeItemInput,
  collection: Awaited<ReturnType<typeof getUserCollection>>,
  ownerLabel: string,
) {
  const card = collection.cards[input.cardId]
  if (!card || card.count < input.quantity) {
    throw new TradeError(
      `${ownerLabel} no longer owns enough of one of these cards`,
      409,
    )
  }
  return {
    offerId,
    side,
    cardId: card.id,
    quantity: input.quantity,
    setId: card.setId,
    name: card.name,
    number: card.number,
    rarity: card.rarity,
    tier: card.tier,
    foil: card.foil,
    rainbow: card.rainbow,
    imageSmall: card.imageSmall,
    imageLarge: card.imageLarge,
  }
}

async function loadParties(
  ids: string[],
): Promise<Map<string, TradeParty>> {
  const db = requireDb()
  if (ids.length === 0) return new Map()
  const rows = await db
    .select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(inArray(users.id, ids))
  return new Map(rows.map((r) => [r.id, r]))
}

function assembleOffer(
  row: OfferRow,
  items: ItemRow[],
  parties: Map<string, TradeParty>,
  viewerId: string,
): TradeOffer {
  const fallback = (id: string): TradeParty => ({ id, name: null, image: null })
  const fromItems: TradeItem[] = []
  const toItems: TradeItem[] = []
  for (const item of items) {
    if (item.offerId !== row.id) continue
    ;(item.side === 'from' ? fromItems : toItems).push(rowToItem(item))
  }
  return {
    id: row.id,
    status: row.status as TradeOffer['status'],
    message: row.message,
    replacesId: row.replacesId,
    createdAt: row.createdAt.getTime(),
    respondedAt: row.respondedAt?.getTime() ?? null,
    outgoing: row.fromUserId === viewerId,
    from: parties.get(row.fromUserId) ?? fallback(row.fromUserId),
    to: parties.get(row.toUserId) ?? fallback(row.toUserId),
    fromItems,
    toItems,
  }
}

/** Fetch every pending offer the user is a party to, grouped for the UI. */
export async function getTradeOverview(
  userId: string,
): Promise<TradeOverview> {
  const db = requireDb()

  const offers = await db
    .select()
    .from(tradeOffers)
    .where(
      and(
        eq(tradeOffers.status, 'pending'),
        or(
          eq(tradeOffers.fromUserId, userId),
          eq(tradeOffers.toUserId, userId),
        ),
      ),
    )

  if (offers.length === 0) return emptyTradeOverview()

  const offerIds = offers.map((o) => o.id)
  const items = await db
    .select()
    .from(tradeOfferItems)
    .where(inArray(tradeOfferItems.offerId, offerIds))

  const partyIds = new Set<string>()
  for (const o of offers) {
    partyIds.add(o.fromUserId)
    partyIds.add(o.toUserId)
  }
  const parties = await loadParties([...partyIds])

  const overview = emptyTradeOverview()
  for (const row of offers) {
    const offer = assembleOffer(row, items, parties, userId)
    if (offer.outgoing) {
      overview.outgoing.push(offer)
    } else {
      overview.incoming.push(offer)
      overview.incomingCount += 1
      overview.pendingByFriend[row.fromUserId] =
        (overview.pendingByFriend[row.fromUserId] ?? 0) + 1
    }
  }

  const byNewest = (a: TradeOffer, b: TradeOffer) => b.createdAt - a.createdAt
  overview.incoming.sort(byNewest)
  overview.outgoing.sort(byNewest)
  return overview
}

/** Load a single offer's full detail; only parties to it may read it. */
export async function getTradeOffer(
  userId: string,
  offerId: number,
): Promise<TradeOffer> {
  const db = requireDb()
  const rows = await db
    .select()
    .from(tradeOffers)
    .where(eq(tradeOffers.id, offerId))
    .limit(1)

  const row = rows[0]
  if (!row) throw new TradeError('Trade offer not found', 404)
  if (row.fromUserId !== userId && row.toUserId !== userId) {
    throw new TradeError('You cannot view this trade offer', 403)
  }

  const items = await db
    .select()
    .from(tradeOfferItems)
    .where(eq(tradeOfferItems.offerId, offerId))

  const parties = await loadParties([row.fromUserId, row.toUserId])
  return assembleOffer(row, items, parties, userId)
}

/**
 * Create a new offer (or a counter-offer when `replacesId` is set). Validates
 * the friendship and that both parties currently own everything on their side.
 */
export async function createTradeOffer(
  fromUserId: string,
  input: CreateTradeInput,
): Promise<number> {
  const db = requireDb()
  const toUserId = input.toUserId

  await assertFriends(fromUserId, toUserId)

  if (input.fromItems.length === 0 && input.toItems.length === 0) {
    throw new TradeError('An offer needs at least one card', 400)
  }

  const [fromCollection, toCollection] = await Promise.all([
    getUserCollection(fromUserId),
    getUserCollection(toUserId),
  ])

  // When countering, verify the offer being replaced is a live offer that this
  // user is the recipient of, then mark it superseded inside the transaction.
  let replaces: OfferRow | null = null
  if (input.replacesId != null) {
    const rows = await db
      .select()
      .from(tradeOffers)
      .where(eq(tradeOffers.id, input.replacesId))
      .limit(1)
    const original = rows[0]
    if (!original || original.status !== 'pending') {
      throw new TradeError('The offer you are modifying is no longer open', 409)
    }
    if (original.toUserId !== fromUserId || original.fromUserId !== toUserId) {
      throw new TradeError('You cannot modify this offer', 403)
    }
    replaces = original
  }

  const now = new Date()

  return db.transaction(async (tx) => {
    if (replaces) {
      const [res] = await tx
        .update(tradeOffers)
        .set({ status: 'countered', respondedAt: now })
        .where(
          and(eq(tradeOffers.id, replaces.id), eq(tradeOffers.status, 'pending')),
        )
      if (res.affectedRows === 0) {
        throw new TradeError('The offer you are modifying is no longer open', 409)
      }
    }

    const [header] = await tx.insert(tradeOffers).values({
      fromUserId,
      toUserId,
      status: 'pending',
      message: input.message ?? null,
      replacesId: replaces?.id ?? null,
      createdAt: now,
    })
    const offerId = Number(header.insertId)

    const itemRows = [
      ...input.fromItems.map((item) =>
        itemValues(offerId, 'from', item, fromCollection, 'You'),
      ),
      ...input.toItems.map((item) =>
        itemValues(offerId, 'to', item, toCollection, 'The other player'),
      ),
    ]
    if (itemRows.length > 0) {
      await tx.insert(tradeOfferItems).values(itemRows)
    }

    return offerId
  })
}

/**
 * Move `quantity` copies of a card from one user to another inside a
 * transaction. Throws if the giver no longer owns enough (atomic guard).
 */
async function moveCard(
  tx: Parameters<Parameters<ReturnType<typeof requireDb>['transaction']>[0]>[0],
  giverId: string,
  receiverId: string,
  item: ItemRow,
  now: Date,
): Promise<void> {
  const [dec] = await tx
    .update(collectedCards)
    .set({ count: sql`${collectedCards.count} - ${item.quantity}` })
    .where(
      and(
        eq(collectedCards.userId, giverId),
        eq(collectedCards.cardId, item.cardId),
        gte(collectedCards.count, item.quantity),
      ),
    )
  if (dec.affectedRows === 0) {
    throw new TradeError(
      'One of the cards in this trade is no longer available',
      409,
    )
  }

  await tx
    .delete(collectedCards)
    .where(
      and(
        eq(collectedCards.userId, giverId),
        eq(collectedCards.cardId, item.cardId),
        lte(collectedCards.count, 0),
      ),
    )

  await tx
    .insert(collectedCards)
    .values({
      userId: receiverId,
      cardId: item.cardId,
      setId: item.setId,
      name: item.name,
      number: item.number,
      rarity: item.rarity,
      tier: item.tier,
      foil: item.foil,
      rainbow: item.rainbow,
      imageSmall: item.imageSmall,
      imageLarge: item.imageLarge,
      count: item.quantity,
      firstPulledAt: now,
      lastPulledAt: now,
    })
    .onDuplicateKeyUpdate({
      set: {
        count: sql`${collectedCards.count} + ${item.quantity}`,
        lastPulledAt: now,
      },
    })
}

/** Accept, decline, or cancel an offer. Accepting swaps cards atomically. */
export async function respondToTrade(
  userId: string,
  offerId: number,
  action: TradeResponseAction,
): Promise<void> {
  const db = requireDb()

  const rows = await db
    .select()
    .from(tradeOffers)
    .where(eq(tradeOffers.id, offerId))
    .limit(1)
  const offer = rows[0]
  if (!offer) throw new TradeError('Trade offer not found', 404)
  if (offer.status !== 'pending') {
    throw new TradeError('This offer has already been resolved', 409)
  }

  if (action === 'cancel') {
    if (offer.fromUserId !== userId) {
      throw new TradeError('Only the sender can cancel this offer', 403)
    }
  } else if (offer.toUserId !== userId) {
    throw new TradeError('Only the recipient can respond to this offer', 403)
  }

  const now = new Date()

  if (action === 'decline' || action === 'cancel') {
    await db
      .update(tradeOffers)
      .set({
        status: action === 'decline' ? 'declined' : 'cancelled',
        respondedAt: now,
      })
      .where(
        and(eq(tradeOffers.id, offerId), eq(tradeOffers.status, 'pending')),
      )
    return
  }

  // Accept: the friendship must still hold and both sides must still own their
  // cards. All checks and the swap happen in one transaction.
  await assertFriends(offer.fromUserId, offer.toUserId)

  const items = await db
    .select()
    .from(tradeOfferItems)
    .where(eq(tradeOfferItems.offerId, offerId))

  await db.transaction(async (tx) => {
    // Claim the offer first so a concurrent accept can't double-swap.
    const [claim] = await tx
      .update(tradeOffers)
      .set({ status: 'accepted', respondedAt: now })
      .where(
        and(eq(tradeOffers.id, offerId), eq(tradeOffers.status, 'pending')),
      )
    if (claim.affectedRows === 0) {
      throw new TradeError('This offer has already been resolved', 409)
    }

    for (const item of items) {
      if (item.side === 'from') {
        await moveCard(tx, offer.fromUserId, offer.toUserId, item, now)
      } else {
        await moveCard(tx, offer.toUserId, offer.fromUserId, item, now)
      }
    }
  })
}
