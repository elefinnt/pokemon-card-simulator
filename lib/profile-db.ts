import { and, eq, inArray, sql } from 'drizzle-orm'
import { requireDb } from '@/db'
import {
  collectedCards,
  profiles,
  users,
  userStats,
} from '@/db/schema'
import type { CardTier } from './pokemon'
import { areFriends } from './friends-db'
import {
  type MyProfile,
  type ProfileStats,
  type PublicProfile,
  type ShowcaseCard,
  DEFAULT_ACCENT,
  SHOWCASE_MAX,
  normaliseAccent,
} from './profile-types'

/** Error carrying an HTTP status so route handlers can map it directly. */
export class ProfileError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = 'ProfileError'
    this.status = status
  }
}

function rowToShowcase(cards: unknown): ShowcaseCard[] {
  if (!Array.isArray(cards)) return []
  return cards.slice(0, SHOWCASE_MAX) as ShowcaseCard[]
}

/** Fetch the caller's own editable profile, filling in sensible defaults. */
export async function getMyProfile(userId: string): Promise<MyProfile> {
  const db = requireDb()

  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)

  const row = rows[0]
  return {
    displayName: row?.displayName ?? null,
    bio: row?.bio ?? null,
    accent: normaliseAccent(row?.accent),
    showcase: rowToShowcase(row?.showcase),
  }
}

/** Upsert the free-text and cosmetic parts of a profile. */
export async function updateProfileDetails(
  userId: string,
  input: { displayName: string | null; bio: string | null; accent: string },
): Promise<MyProfile> {
  const db = requireDb()
  const accent = normaliseAccent(input.accent)
  const now = new Date()

  await db
    .insert(profiles)
    .values({
      userId,
      displayName: input.displayName,
      bio: input.bio,
      accent,
      updatedAt: now,
    })
    .onDuplicateKeyUpdate({
      set: {
        displayName: input.displayName,
        bio: input.bio,
        accent,
        updatedAt: now,
      },
    })

  return getMyProfile(userId)
}

/**
 * Replace the showcase with up to SHOWCASE_MAX cards. Each card id must be one
 * the user actually owns; snapshots are built from their collection so the
 * showcase renders without a later join.
 */
export async function updateShowcase(
  userId: string,
  cardIds: string[],
): Promise<MyProfile> {
  const db = requireDb()

  const unique: string[] = []
  for (const id of cardIds) {
    if (typeof id === 'string' && id && !unique.includes(id)) unique.push(id)
    if (unique.length >= SHOWCASE_MAX) break
  }

  let showcase: ShowcaseCard[] = []
  if (unique.length > 0) {
    const owned = await db
      .select()
      .from(collectedCards)
      .where(
        and(
          eq(collectedCards.userId, userId),
          inArray(collectedCards.cardId, unique),
        ),
      )

    const byId = new Map(owned.map((c) => [c.cardId, c]))

    // Preserve the caller's chosen order and silently drop anything unowned.
    showcase = unique
      .map((id) => byId.get(id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => ({
        id: c.cardId,
        setId: c.setId,
        name: c.name,
        number: c.number,
        rarity: c.rarity,
        tier: c.tier as CardTier,
        foil: c.foil,
        rainbow: c.rainbow,
        imageSmall: c.imageSmall,
        imageLarge: c.imageLarge,
      }))
  }

  const now = new Date()
  await db
    .insert(profiles)
    .values({
      userId,
      accent: DEFAULT_ACCENT,
      showcase,
      updatedAt: now,
    })
    .onDuplicateKeyUpdate({
      set: { showcase, updatedAt: now },
    })

  return getMyProfile(userId)
}

async function loadStats(userId: string): Promise<ProfileStats> {
  const db = requireDb()

  const [stats, ownedCount] = await Promise.all([
    db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1),
    db
      .select({ value: sql<number>`count(*)` })
      .from(collectedCards)
      .where(eq(collectedCards.userId, userId)),
  ])

  return {
    totalPacksOpened: stats[0]?.totalPacksOpened ?? 0,
    totalCardsPulled: stats[0]?.totalCardsPulled ?? 0,
    uniqueOwned: Number(ownedCount[0]?.value ?? 0),
  }
}

/**
 * Load a player's public-facing profile. Visible to the owner and to accepted
 * friends only; anyone else gets a ProfileError(403).
 */
export async function getPublicProfile(
  viewerId: string,
  targetId: string,
): Promise<PublicProfile> {
  const db = requireDb()
  const isSelf = viewerId === targetId

  if (!isSelf && !(await areFriends(viewerId, targetId))) {
    throw new ProfileError('You can only view profiles of your friends', 403)
  }

  const [userRows, profileRows, stats] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        friendCode: users.friendCode,
      })
      .from(users)
      .where(eq(users.id, targetId))
      .limit(1),
    db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, targetId))
      .limit(1),
    loadStats(targetId),
  ])

  const user = userRows[0]
  if (!user) {
    throw new ProfileError('Player not found', 404)
  }

  const profile = profileRows[0]

  return {
    userId: user.id,
    name: user.name,
    displayName: profile?.displayName ?? null,
    image: user.image,
    bio: profile?.bio ?? null,
    accent: normaliseAccent(profile?.accent),
    friendCode: user.friendCode,
    showcase: rowToShowcase(profile?.showcase),
    stats,
    friendsSince: null,
    isSelf,
  }
}
