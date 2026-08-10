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
