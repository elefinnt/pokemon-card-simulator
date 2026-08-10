/** Shared feedback constants and types, safe to import on client or server. */

export const FEEDBACK_CATEGORIES = ['bug', 'idea', 'other'] as const
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: 'Bug report',
  idea: 'Idea or suggestion',
  other: 'Something else',
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
  /** Contact email for follow-up (account email or typed by the visitor). */
  email: string | null
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
