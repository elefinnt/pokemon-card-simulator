import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm'
import { requireDb } from '@/db'
import { packOpenings, packOpeningReactions, users } from '@/db/schema'
import type { CardTier, OpenedPack, PokemonCard } from '@/lib/pokemon'
import {
  type FeedEvent,
  type ReactionKey,
  emptyReactionCounts,
  isReactionKey,
} from './types'

const FEED_WINDOW_MINUTES = 60
const FEED_LIMIT = 50

export async function recordPackOpening(
  userId: string,
  input: {
    setId: string
    packName: string
    series: string
    opened: OpenedPack
  },
): Promise<void> {
  const db = requireDb()
  await db.insert(packOpenings).values({
    userId,
    setId: input.setId,
    packName: input.packName,
    series: input.series,
    bestTier: input.opened.bestTier,
    cardCount: input.opened.cards.length,
    cards: input.opened.cards,
    createdAt: new Date(),
  })
}

export async function getCommunityFeed(
  viewerId: string | null,
): Promise<FeedEvent[]> {
  const db = requireDb()
  const now = Date.now()
  const cutoff = new Date(now - FEED_WINDOW_MINUTES * 60_000)

  const rows = await db
    .select({
      id: packOpenings.id,
      setId: packOpenings.setId,
      packName: packOpenings.packName,
      series: packOpenings.series,
      bestTier: packOpenings.bestTier,
      cards: packOpenings.cards,
      createdAt: packOpenings.createdAt,
      userId: users.id,
      userName: users.name,
      userImage: users.image,
    })
    .from(packOpenings)
    .innerJoin(users, eq(users.id, packOpenings.userId))
    .where(gte(packOpenings.createdAt, cutoff))
    .orderBy(desc(packOpenings.createdAt))
    .limit(FEED_LIMIT)

  if (rows.length === 0) return []

  const ids = rows.map((r) => r.id)

  const [counts, mine] = await Promise.all([
    db
      .select({
        openingId: packOpeningReactions.openingId,
        reaction: packOpeningReactions.reaction,
        total: sql<number>`count(*)`,
      })
      .from(packOpeningReactions)
      .where(inArray(packOpeningReactions.openingId, ids))
      .groupBy(packOpeningReactions.openingId, packOpeningReactions.reaction),
    viewerId
      ? db
          .select({
            openingId: packOpeningReactions.openingId,
            reaction: packOpeningReactions.reaction,
          })
          .from(packOpeningReactions)
          .where(
            and(
              eq(packOpeningReactions.userId, viewerId),
              inArray(packOpeningReactions.openingId, ids),
            ),
          )
      : Promise.resolve([]),
  ])

  const countsByOpening = new Map<number, Record<ReactionKey, number>>()
  for (const row of counts) {
    if (!isReactionKey(row.reaction)) continue
    const bucket = countsByOpening.get(row.openingId) ?? emptyReactionCounts()
    bucket[row.reaction] = Number(row.total)
    countsByOpening.set(row.openingId, bucket)
  }

  const mineByOpening = new Map<number, ReactionKey>()
  for (const row of mine) {
    if (isReactionKey(row.reaction)) mineByOpening.set(row.openingId, row.reaction)
  }

  return rows.map((row) => ({
    id: row.id,
    user: { id: row.userId, name: row.userName, image: row.userImage },
    packId: row.setId,
    packName: row.packName,
    series: row.series,
    minutesAgo: Math.max(
      0,
      Math.floor((now - row.createdAt.getTime()) / 60_000),
    ),
    cards: (row.cards ?? []) as PokemonCard[],
    bestTier: row.bestTier as CardTier,
    reactions: countsByOpening.get(row.id) ?? emptyReactionCounts(),
    myReaction: mineByOpening.get(row.id) ?? null,
  }))
}

/**
 * Toggle a viewer's reaction on an opening. Re-selecting the same reaction
 * removes it; a different reaction replaces it. Returns false if the opening
 * no longer exists.
 */
export async function setReaction(
  userId: string,
  openingId: number,
  reaction: ReactionKey,
): Promise<boolean> {
  const db = requireDb()

  const opening = await db
    .select({ id: packOpenings.id })
    .from(packOpenings)
    .where(eq(packOpenings.id, openingId))
    .limit(1)
  if (!opening[0]) return false

  const existing = await db
    .select({ id: packOpeningReactions.id, reaction: packOpeningReactions.reaction })
    .from(packOpeningReactions)
    .where(
      and(
        eq(packOpeningReactions.openingId, openingId),
        eq(packOpeningReactions.userId, userId),
      ),
    )
    .limit(1)

  if (!existing[0]) {
    await db.insert(packOpeningReactions).values({
      openingId,
      userId,
      reaction,
      createdAt: new Date(),
    })
    return true
  }

  if (existing[0].reaction === reaction) {
    await db
      .delete(packOpeningReactions)
      .where(eq(packOpeningReactions.id, existing[0].id))
    return true
  }

  await db
    .update(packOpeningReactions)
    .set({ reaction, createdAt: new Date() })
    .where(eq(packOpeningReactions.id, existing[0].id))
  return true
}
