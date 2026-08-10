import { desc, eq } from 'drizzle-orm'
import { requireDb } from '@/db'
import { feedback, users } from '@/db/schema'
import {
  type FeedbackCategory,
  type FeedbackEntry,
  type FeedbackStatus,
  FEEDBACK_MESSAGE_MAX_LENGTH,
  FEEDBACK_MESSAGE_MIN_LENGTH,
} from './feedback-types'

/** Error carrying an HTTP status so route handlers can map it directly. */
export class FeedbackError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = 'FeedbackError'
    this.status = status
  }
}

/** Store a new piece of feedback. `userId` is null for anonymous visitors. */
export async function createFeedback(input: {
  userId: string | null
  category: FeedbackCategory
  message: string
  page: string | null
}): Promise<void> {
  const db = requireDb()

  const message = input.message.trim()
  if (message.length < FEEDBACK_MESSAGE_MIN_LENGTH) {
    throw new FeedbackError('Please write a little more detail')
  }
  if (message.length > FEEDBACK_MESSAGE_MAX_LENGTH) {
    throw new FeedbackError('Feedback is too long')
  }

  await db.insert(feedback).values({
    userId: input.userId,
    category: input.category,
    message,
    page: input.page ? input.page.slice(0, 255) : null,
    createdAt: new Date(),
  })
}

/** All feedback, newest first, with the submitter attached where known. */
export async function listFeedback(): Promise<FeedbackEntry[]> {
  const db = requireDb()

  const rows = await db
    .select({
      id: feedback.id,
      category: feedback.category,
      message: feedback.message,
      page: feedback.page,
      status: feedback.status,
      createdAt: feedback.createdAt,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      userImage: users.image,
    })
    .from(feedback)
    .leftJoin(users, eq(feedback.userId, users.id))
    .orderBy(desc(feedback.createdAt))

  return rows.map((row) => ({
    id: row.id,
    category: row.category as FeedbackCategory,
    message: row.message,
    page: row.page,
    status: row.status as FeedbackStatus,
    createdAt: row.createdAt.toISOString(),
    user: row.userId
      ? {
          id: row.userId,
          name: row.userName,
          email: row.userEmail,
          image: row.userImage,
        }
      : null,
  }))
}

export async function setFeedbackStatus(
  id: number,
  status: FeedbackStatus,
): Promise<void> {
  const db = requireDb()
  await db.update(feedback).set({ status }).where(eq(feedback.id, id))
}

export async function deleteFeedback(id: number): Promise<void> {
  const db = requireDb()
  await db.delete(feedback).where(eq(feedback.id, id))
}
