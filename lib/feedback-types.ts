/** Shared feedback constants and types, safe to import on client or server. */

export const FEEDBACK_CATEGORIES = ['pack', 'idea', 'bug', 'other'] as const
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  pack: 'Request a pack',
  idea: 'Suggest a feature',
  bug: 'Report a bug',
  other: 'Something else',
}

export const FEEDBACK_CATEGORY_HINTS: Record<FeedbackCategory, string> = {
  pack: 'Name the set, and the language if it is not English. Vintage, Japanese and the latest drops are all welcome.',
  idea: 'What would make PackRip better for you?',
  bug: 'What happened, and what did you expect instead?',
  other: 'Anything else — praise, questions or notes.',
}

export const FEEDBACK_CATEGORY_PLACEHOLDERS: Record<FeedbackCategory, string> =
  {
    pack: 'e.g. Paldea Evolved, Japanese 151, Base Set 2…',
    idea: 'e.g. a binder view by rarity, or filters on trades…',
    bug: 'e.g. the holo shine froze after ripping Evolving Skies…',
    other: "Tell me what's on your mind…",
  }

export const FEEDBACK_STATUSES = ['new', 'reviewed', 'done'] as const
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]

export const FEEDBACK_MESSAGE_MIN_LENGTH = 5
export const FEEDBACK_MESSAGE_MAX_LENGTH = 1000
export const FEEDBACK_EMAIL_MAX_LENGTH = 255

/** Light-touch check — real validation happens when the owner replies. */
export function isValidFeedbackEmail(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= FEEDBACK_EMAIL_MAX_LENGTH &&
    /^\S+@\S+\.\S+$/.test(value.trim())
  )
}

export function isFeedbackCategory(value: unknown): value is FeedbackCategory {
  return (
    typeof value === 'string' &&
    (FEEDBACK_CATEGORIES as readonly string[]).includes(value)
  )
}

export function isFeedbackStatus(value: unknown): value is FeedbackStatus {
  return (
    typeof value === 'string' &&
    (FEEDBACK_STATUSES as readonly string[]).includes(value)
  )
}

/** A feedback row joined with the submitter (null when anonymous). */
export interface FeedbackEntry {
  id: number
  category: FeedbackCategory
  message: string
  /** Contact email when the visitor opted in to a follow-up. */
  email: string | null
  /** True when the visitor said it is fine to get in touch. */
  contactOk: boolean
  page: string | null
  status: FeedbackStatus
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
}
