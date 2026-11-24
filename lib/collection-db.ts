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
import { mergeCollections } from './collection-merge'
import { setIdFromCardId } from './set-companions'

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
): Promise<void> {
  const db = requireDb()
  const now = new Date()
  // Count duplicates within this pack before the single atomic upsert. Avoid
  // loading the player's entire binder on every opening.
  const cards = new Map<string, { card: OpenedPack['cards'][number]; count: number }>()
  for (const card of opened.cards) {
    const existing = cards.get(card.id)
    cards.set(card.id, { card, count: (existing?.count ?? 0) + 1 })
  }

  await db.transaction(async (tx) => {
    if (cards.size > 0) {
      await tx
        .insert(collectedCards)
        .values([...cards.values()].sort((a, b) => a.card.id.localeCompare(b.card.id)).map(({ card, count }) => ({
          userId,
          cardId: card.id,
          setId: setIdFromCardId(card.id),
          name: card.name,
          number: card.number,
          rarity: card.rarity,
          tier: card.tier,
          foil: card.foil,
          rainbow: card.rainbow,
          imageSmall: card.imageSmall,
          imageLarge: card.imageLarge,
          count,
          firstPulledAt: now,
          lastPulledAt: now,
        })))
        .onDuplicateKeyUpdate({
          set: {
            count: sql`${collectedCards.count} + VALUES(count)`,
            lastPulledAt: now,
          },
        })
    }

    await tx
      .insert(setProgress)
      .values({
        userId,
        setId: opened.setId,
        poolTotal: opened.poolTotal,
        packsOpened: 1,
      })
      .onDuplicateKeyUpdate({
        set: {
          poolTotal: opened.poolTotal,
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
