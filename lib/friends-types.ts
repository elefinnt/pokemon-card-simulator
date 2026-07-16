import type { ShowcaseCard } from './profile-types'

/** A confirmed friend (an accepted friendship). */
export interface Friend {
  id: string
  name: string | null
  image: string | null
  friendCode: string | null
  since: number | null
  // Profile preview fields (populated when the profiles table is available)
  // so hover cards render instantly without a per-friend fetch.
  displayName?: string | null
  bio?: string | null
  accent?: string | null
  showcase?: ShowcaseCard[]
}

/** A pending friend request, either incoming or outgoing. */
export interface FriendRequest {
  userId: string
  name: string | null
  image: string | null
  friendCode: string | null
  createdAt: number
}

/** The full friends payload returned by GET /api/friends. */
export interface FriendsOverview {
  friends: Friend[]
  incoming: FriendRequest[]
  outgoing: FriendRequest[]
}

export type RequestAction = 'accept' | 'decline'

export const FRIEND_CODE_LENGTH = 10
// Unambiguous alphabet: no 0/O/1/I/L to keep codes easy to read and share.
export const FRIEND_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

const FRIEND_CODE_RE = new RegExp(
  `^[${FRIEND_CODE_ALPHABET}]{${FRIEND_CODE_LENGTH}}$`,
)

/** Normalise user-entered codes (trim, uppercase, strip spaces/dashes). */
export function normaliseFriendCode(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]/g, '')
}

export function isValidFriendCode(input: string): boolean {
  return FRIEND_CODE_RE.test(normaliseFriendCode(input))
}

export function emptyOverview(): FriendsOverview {
  return { friends: [], incoming: [], outgoing: [] }
}

export function isRequestAction(value: unknown): value is RequestAction {
  return value === 'accept' || value === 'decline'
}
