import { eq } from 'drizzle-orm'
import { requireDb } from '@/db'
import { users } from '@/db/schema'

/**
 * Permanently delete a user and all of their data.
 *
 * Every user-owned table references `users.id` with `onDelete: 'cascade'`
 * (auth account/session, profile, collection, stats, friendships, community
 * openings and reactions, trade offers and items), so removing the single
 * `user` row cascades to wipe everything the account ever stored.
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  const db = requireDb()
  await db.delete(users).where(eq(users.id, userId))
}
