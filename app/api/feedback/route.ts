import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { FeedbackError, createFeedback } from '@/lib/feedback-db'
import { isFeedbackCategory } from '@/lib/feedback-types'
import { notifyFeedbackSubmitted } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // Feedback is open to signed-out visitors too; attach the user when known.
  const session = await auth()

  const body = (await request.json().catch(() => null)) as {
    category?: unknown
    message?: unknown
    email?: unknown
    contactOk?: unknown
    page?: unknown
  } | null

  if (!body || typeof body.message !== 'string') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const contactOk = body.contactOk === true
  const category = isFeedbackCategory(body.category) ? body.category : 'other'
  const page = typeof body.page === 'string' ? body.page : null

  // The account email always wins so signed-in feedback can't spoof a contact
  // address; anonymous visitors supply one themselves when they opt in.
  const email = contactOk
    ? (session?.user?.email ??
      (typeof body.email === 'string' ? body.email : null))
    : null

  try {
    await createFeedback({
      userId: session?.user?.id ?? null,
      email,
      contactOk,
      category,
      message: body.message,
      page,
    })
    await notifyFeedbackSubmitted({
      category,
      message: body.message,
      page,
      contactOk,
      email,
      userName: session?.user?.name ?? null,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof FeedbackError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.log(
      '[feedback] submit failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to send your feedback' },
      { status: 500 },
    )
  }
}
