import type { CardTier, PokemonCard } from '@/lib/pokemon'

// ---- Reactions -------------------------------------------------------------

export type ReactionKey = 'fire' | 'love' | 'wow' | 'haha'

export interface ReactionDef {
  key: ReactionKey
  emoji: string
  label: string
}

export const REACTIONS: ReactionDef[] = [
  { key: 'fire', emoji: '🔥', label: 'Fire' },
  { key: 'love', emoji: '😍', label: 'Love' },
  { key: 'wow', emoji: '😮', label: 'Wow' },
  { key: 'haha', emoji: '😂', label: 'Haha' },
]

const REACTION_KEYS = REACTIONS.map((r) => r.key)

export function isReactionKey(value: unknown): value is ReactionKey {
  return typeof value === 'string' && REACTION_KEYS.includes(value as ReactionKey)
}

export function emptyReactionCounts(): Record<ReactionKey, number> {
  return { fire: 0, love: 0, wow: 0, haha: 0 }
}

// ---- Feed types ------------------------------------------------------------

export interface FeedUser {
  id: string
  name: string | null
  image: string | null
}

export interface FeedEvent {
  id: number
  user: FeedUser
  packId: string
  packName: string
  series: string
  /** minutes since the pack was opened */
  minutesAgo: number
  cards: PokemonCard[]
  bestTier: CardTier
  reactions: Record<ReactionKey, number>
  /** the signed-in viewer's current reaction, if any */
  myReaction: ReactionKey | null
}

export interface CommunityFeed {
  events: FeedEvent[]
}
