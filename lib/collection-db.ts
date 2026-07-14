import { eq, sql } from 'drizzle-orm'
import { requireDb } from '@/db'
import {
  collectedCards,
  setProgress,
  userStats,
} from '@/db/schema'
import type { CardTier } from './pokemon'
import type { OpenedPack } from './pokemon'
import {
  type CollectionData,
  type CollectedCard,
  emptyCollection,
} from './collection-types'
import { mergeCollections, mergePackIntoCollection } from './collection-merge'

function rowToCard(row: typeof collectedCards.$inferSelect): CollectedCard {
  return {
    id: row.cardId,
    setId: row.setId,
    name: row.name,
    number: row.number,
    rarity: row.rarity,
    tier: row.tier as CardTier,
    foil: row.foil,
    rainbow: row.rainbow,
    imageSmall: row.imageSmall,
    imageLarge: row.imageLarge,
    count: row.count,
    firstPulledAt: row.firstPulledAt.getTime(),
    lastPulledAt: row.lastPulledAt.getTime(),
  }
}

export async function getUserCollection(
  userId: string,
): Promise<CollectionData> {
  const db = requireDb()

  const [cards, sets, stats] = await Promise.all([
    db
      .select()
      .from(collectedCards)
      .where(eq(collectedCards.userId, userId)),
    db
      .select()
      .from(setProgress)
      .where(eq(setProgress.userId, userId)),
    db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1),
  ])

  const data = emptyCollection()

  for (const row of cards) {
    data.cards[row.cardId] = rowToCard(row)
  }

  for (const row of sets) {
    data.sets[row.setId] = {
      setId: row.setId,
      poolTotal: row.poolTotal,
      packsOpened: row.packsOpened,
    }
  }

  if (stats[0]) {
    data.totalPacksOpened = stats[0].totalPacksOpened
    data.totalCardsPulled = stats[0].totalCardsPulled
  }

  return data
}

export async function recordPackForUser(
  userId: string,
  opened: OpenedPack,
): Promise<CollectionData> {
  const db = requireDb()
  const now = new Date()
  const current = await getUserCollection(userId)
  const next = mergePackIntoCollection(current, opened, now.getTime())

  await db.transaction(async (tx) => {
    for (const card of opened.cards) {
      const merged = next.cards[card.id]
      await tx
        .insert(collectedCards)
        .values({
          userId,
          cardId: card.id,
          setId: opened.setId,
          name: card.name,
          number: card.number,
          rarity: card.rarity,
          tier: card.tier,
          foil: card.foil,
          rainbow: card.rainbow,
          imageSmall: card.imageSmall,
          imageLarge: card.imageLarge,
          count: merged.count,
          firstPulledAt: new Date(merged.firstPulledAt),
          lastPulledAt: new Date(merged.lastPulledAt),
        })
        .onDuplicateKeyUpdate({
          set: {
            count: sql`${collectedCards.count} + 1`,
            lastPulledAt: now,
          },
        })
    }

    const set = next.sets[opened.setId]
    await tx
      .insert(setProgress)
      .values({
        userId,
        setId: opened.setId,
        poolTotal: set.poolTotal,
        packsOpened: set.packsOpened,
      })
      .onDuplicateKeyUpdate({
        set: {
          poolTotal: set.poolTotal,
          packsOpened: sql`${setProgress.packsOpened} + 1`,
        },
      })

    await tx
      .insert(userStats)
      .values({
        userId,
        totalPacksOpened: 1,
        totalCardsPulled: opened.cards.length,
      })
      .onDuplicateKeyUpdate({
        set: {
          totalPacksOpened: sql`${userStats.totalPacksOpened} + 1`,
          totalCardsPulled: sql`${userStats.totalCardsPulled} + ${opened.cards.length}`,
        },
      })
  })

  return next
}

export async function resetUserCollection(userId: string): Promise<void> {
  const db = requireDb()

  await db.transaction(async (tx) => {
    await tx
      .delete(collectedCards)
      .where(eq(collectedCards.userId, userId))
    await tx.delete(setProgress).where(eq(setProgress.userId, userId))
    await tx.delete(userStats).where(eq(userStats.userId, userId))
  })
}

export async function importUserCollection(
  userId: string,
  incoming: CollectionData,
): Promise<CollectionData> {
  const db = requireDb()
  const current = await getUserCollection(userId)
  const merged = mergeCollections(current, incoming)

  await db.transaction(async (tx) => {
    await tx
      .delete(collectedCards)
      .where(eq(collectedCards.userId, userId))
    await tx.delete(setProgress).where(eq(setProgress.userId, userId))
    await tx.delete(userStats).where(eq(userStats.userId, userId))

    const cardRows = Object.values(merged.cards).map((card) => ({
      userId,
      cardId: card.id,
      setId: card.setId,
      name: card.name,
      number: card.number,
      rarity: card.rarity,
      tier: card.tier,
      foil: card.foil,
      rainbow: card.rainbow,
      imageSmall: card.imageSmall,
      imageLarge: card.imageLarge,
      count: card.count,
      firstPulledAt: new Date(card.firstPulledAt),
      lastPulledAt: new Date(card.lastPulledAt),
    }))

    if (cardRows.length > 0) {
      await tx.insert(collectedCards).values(cardRows)
    }

    const setRows = Object.values(merged.sets).map((set) => ({
      userId,
      setId: set.setId,
      poolTotal: set.poolTotal,
      packsOpened: set.packsOpened,
    }))

    if (setRows.length > 0) {
      await tx.insert(setProgress).values(setRows)
    }

    await tx.insert(userStats).values({
      userId,
      totalPacksOpened: merged.totalPacksOpened,
      totalCardsPulled: merged.totalCardsPulled,
    })
  })

  return merged
}
