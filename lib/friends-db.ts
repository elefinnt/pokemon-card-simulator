import { randomInt } from 'node:crypto'
import { and, eq, inArray, or } from 'drizzle-orm'
import { requireDb } from '@/db'
import { friendships, profiles, users } from '@/db/schema'
import type { ShowcaseCard } from './profile-types'
import { SHOWCASE_MAX } from './profile-types'
import {
  FRIEND_CODE_ALPHABET,
  FRIEND_CODE_LENGTH,
  type Friend,
  type FriendRequest,
  type FriendsOverview,
  type RequestAction,
  emptyOverview,
  normaliseFriendCode,
} from './friends-types'

/** Error with an HTTP status so route handlers can map it directly. */
export class FriendError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = 'FriendError'
    this.status = status
  }
}

function generateCode(): string {
  let out = ''
  for (let i = 0; i < FRIEND_CODE_LENGTH; i += 1) {
    out += FRIEND_CODE_ALPHABET[randomInt(FRIEND_CODE_ALPHABET.length)]
  }
  return out
}

/** Return the caller's friend code, lazily generating a unique one. */
export async function ensureFriendCode(userId: string): Promise<string> {
  const db = requireDb()

  const existing = await db
    .select({ friendCode: users.friendCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!existing[0]) {
    throw new FriendError('User not found', 404)
  }
  if (existing[0].friendCode) {
    return existing[0].friendCode
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateCode()
    const clash = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.friendCode, code))
      .limit(1)
    if (clash[0]) continue

    await db.update(users).set({ friendCode: code }).where(eq(users.id, userId))
    return code
  }

  throw new FriendError('Could not generate a friend code', 500)
}

/**
 * Return true when the two users have an accepted friendship (either
 * direction). Used to gate friend-only features such as trades.
 */
export async function areFriends(
  userId: string,
  otherId: string,
): Promise<boolean> {
  const db = requireDb()

  const rows = await db
    .select({ id: friendships.id })
    .from(friendships)
    .where(
      and(
        eq(friendships.status, 'accepted'),
        or(
          and(
            eq(friendships.requesterId, userId),
            eq(friendships.addresseeId, otherId),
          ),
          and(
            eq(friendships.requesterId, otherId),
            eq(friendships.addresseeId, userId),
          ),
        ),
      ),
    )
    .limit(1)

  return rows.length > 0
}

/** Throw a FriendError unless the two users are accepted friends. */
export async function assertFriends(
  userId: string,
  otherId: string,
): Promise<void> {
  if (userId === otherId) {
    throw new FriendError('You cannot trade with yourself', 400)
  }
  if (!(await areFriends(userId, otherId))) {
    throw new FriendError('You are not friends with this player', 403)
  }
}

interface ProfilePreview {
  displayName: string | null
  bio: string | null
  accent: string | null
  showcase: ShowcaseCard[]
}

/**
 * Load lightweight profile previews for a set of users. Defensive by design:
 * if the profiles table has not been migrated yet, this returns an empty map
 * so the friends list keeps working.
 */
async function loadProfilePreviews(
  ids: string[],
): Promise<Map<string, ProfilePreview>> {
  const map = new Map<string, ProfilePreview>()
  if (ids.length === 0) return map

  try {
    const db = requireDb()
    const rows = await db
      .select({
        userId: profiles.userId,
        displayName: profiles.displayName,
        bio: profiles.bio,
        accent: profiles.accent,
        showcase: profiles.showcase,
      })
      .from(profiles)
      .where(inArray(profiles.userId, ids))

    for (const row of rows) {
      map.set(row.userId, {
        displayName: row.displayName ?? null,
        bio: row.bio ?? null,
        accent: row.accent ?? null,
        showcase: Array.isArray(row.showcase)
          ? (row.showcase as ShowcaseCard[]).slice(0, SHOWCASE_MAX)
          : [],
      })
    }
  } catch (err) {
    console.log(
      '[friends] profile preview load skipped:',
      err instanceof Error ? err.message : err,
    )
  }

  return map
}

export async function getFriendsOverview(
  userId: string,
): Promise<FriendsOverview> {
  const db = requireDb()

  const rows = await db
    .select()
    .from(friendships)
    .where(
      or(
        eq(friendships.requesterId, userId),
        eq(friendships.addresseeId, userId),
      ),
    )

  if (rows.length === 0) return emptyOverview()

  // Collect the "other" user ids so we can join profile fields in one query.
  const otherIds = new Set<string>()
  for (const row of rows) {
    otherIds.add(row.requesterId === userId ? row.addresseeId : row.requesterId)
  }

  const friendUsers = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      friendCode: users.friendCode,
    })
    .from(users)
    .where(inArray(users.id, [...otherIds]))

  const profileById = new Map(friendUsers.map((p) => [p.id, p]))
  const previewById = await loadProfilePreviews([...otherIds])

  const overview = emptyOverview()

  for (const row of rows) {
    const otherId =
      row.requesterId === userId ? row.addresseeId : row.requesterId
    const profile = profileById.get(otherId)
    if (!profile) continue

    if (row.status === 'accepted') {
      const preview = previewById.get(otherId)
      const friend: Friend = {
        id: profile.id,
        name: profile.name,
        image: profile.image,
        friendCode: profile.friendCode,
        since: row.respondedAt?.getTime() ?? null,
        displayName: preview?.displayName ?? null,
        bio: preview?.bio ?? null,
        accent: preview?.accent ?? null,
        showcase: preview?.showcase ?? [],
      }
      overview.friends.push(friend)
      continue
    }

    // Pending: incoming if someone requested us, outgoing if we requested them.
    const request: FriendRequest = {
      userId: profile.id,
      name: profile.name,
      image: profile.image,
      friendCode: profile.friendCode,
      createdAt: row.createdAt.getTime(),
    }
    if (row.addresseeId === userId) {
      overview.incoming.push(request)
    } else {
      overview.outgoing.push(request)
    }
  }

  return overview
}

export async function sendFriendRequestByCode(
  userId: string,
  rawCode: string,
): Promise<void> {
  const db = requireDb()
  const code = normaliseFriendCode(rawCode)

  const target = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.friendCode, code))
    .limit(1)

  const targetId = target[0]?.id
  if (!targetId) {
    throw new FriendError('No player found with that friend code', 404)
  }
  if (targetId === userId) {
    throw new FriendError('You cannot add yourself', 400)
  }

  const existing = await db
    .select({ status: friendships.status })
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, targetId),
        ),
        and(
          eq(friendships.requesterId, targetId),
          eq(friendships.addresseeId, userId),
        ),
      ),
    )
    .limit(1)

  if (existing[0]) {
    if (existing[0].status === 'accepted') {
      throw new FriendError('You are already friends', 409)
    }
    throw new FriendError('There is already a pending request', 409)
  }

  await db.insert(friendships).values({
    requesterId: userId,
    addresseeId: targetId,
    status: 'pending',
    createdAt: new Date(),
  })
}

export async function respondToRequest(
  userId: string,
  requesterId: string,
  action: RequestAction,
): Promise<void> {
  const db = requireDb()

  // Only the addressee of a pending request may respond to it.
  const pending = await db
    .select({ status: friendships.status })
    .from(friendships)
    .where(
      and(
        eq(friendships.requesterId, requesterId),
        eq(friendships.addresseeId, userId),
        eq(friendships.status, 'pending'),
      ),
    )
    .limit(1)

  if (!pending[0]) {
    throw new FriendError('Friend request not found', 404)
  }

  if (action === 'accept') {
    await db
      .update(friendships)
      .set({ status: 'accepted', respondedAt: new Date() })
      .where(
        and(
          eq(friendships.requesterId, requesterId),
          eq(friendships.addresseeId, userId),
        ),
      )
    return
  }

  await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.requesterId, requesterId),
        eq(friendships.addresseeId, userId),
      ),
    )
}

/** Remove a friend or cancel/withdraw a pending request, in either direction. */
export async function removeFriend(
  userId: string,
  otherId: string,
): Promise<void> {
  const db = requireDb()

  await db
    .delete(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, otherId),
        ),
        and(
          eq(friendships.requesterId, otherId),
          eq(friendships.addresseeId, userId),
        ),
      ),
    )
}
