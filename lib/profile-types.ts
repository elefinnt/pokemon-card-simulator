import type { CardTier } from './pokemon'

/**
 * A denormalised snapshot of a card chosen for a profile showcase. Mirrors the
 * fields needed to render a thumbnail without loading the owner's collection.
 */
export interface ShowcaseCard {
  id: string
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

/** The current player's own profile, used by the edit modal. */
export interface MyProfile {
  displayName: string | null
  bio: string | null
  accent: string
  showcase: ShowcaseCard[]
}

/** Lightweight stats surfaced on a profile card. */
export interface ProfileStats {
  totalPacksOpened: number
  totalCardsPulled: number
  uniqueOwned: number
}

/** A profile as seen by another player (or by the owner in preview). */
export interface PublicProfile {
  userId: string
  name: string | null
  displayName: string | null
  image: string | null
  bio: string | null
  accent: string
  friendCode: string | null
  showcase: ShowcaseCard[]
  stats: ProfileStats
  /** Timestamp (ms) the friendship was established, when applicable. */
  friendsSince: number | null
  /** Whether the viewer is looking at their own profile. */
  isSelf: boolean
}

export const DISPLAY_NAME_MAX_LENGTH = 32
export const BIO_MAX_LENGTH = 240
export const SHOWCASE_MAX = 3

/**
 * Cosmetic accent colours a player can pick for their profile. Values are the
 * raw colour used for glows/borders so they survive Tailwind's purge (applied
 * via inline styles rather than dynamic class names).
 */
export interface Accent {
  id: string
  label: string
  color: string
}

export const ACCENTS: Accent[] = [
  { id: 'crimson', label: 'Crimson', color: '#f43f5e' },
  { id: 'ember', label: 'Ember', color: '#fb923c' },
  { id: 'gold', label: 'Gold', color: '#fbbf24' },
  { id: 'leaf', label: 'Leaf', color: '#4ade80' },
  { id: 'aqua', label: 'Aqua', color: '#22d3ee' },
  { id: 'ocean', label: 'Ocean', color: '#60a5fa' },
  { id: 'violet', label: 'Violet', color: '#a78bfa' },
  { id: 'blossom', label: 'Blossom', color: '#f472b6' },
]

export const DEFAULT_ACCENT = 'ocean'

const ACCENT_BY_ID = new Map(ACCENTS.map((a) => [a.id, a]))

/** Resolve an accent id to its colour, falling back to the default. */
export function accentColor(id: string | null | undefined): string {
  return (
    ACCENT_BY_ID.get(id ?? '')?.color ??
    ACCENT_BY_ID.get(DEFAULT_ACCENT)!.color
  )
}

/** Normalise an accent id, defaulting unknown/empty values. */
export function normaliseAccent(id: string | null | undefined): string {
  return ACCENT_BY_ID.has(id ?? '') ? (id as string) : DEFAULT_ACCENT
}

/** Trim and clamp a free-text field; empty strings become null. */
export function sanitiseText(
  value: unknown,
  maxLength: number,
): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().slice(0, maxLength)
  return trimmed.length > 0 ? trimmed : null
}

/** The name to show for a player: their display name, else the auth name. */
export function resolveDisplayName(
  displayName: string | null | undefined,
  name: string | null | undefined,
): string {
  return displayName?.trim() || name?.trim() || 'Unknown player'
}
