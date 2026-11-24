import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin'
import {
  jsonError,
  parseIntegerParam,
  routeError,
  unauthorised,
} from '@/lib/api-route'
import { deleteFeedback, setFeedbackStatus } from '@/lib/feedback-db'
import { isFeedbackStatus } from '@/lib/feedback-types'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminSession())) return unauthorised()

  const feedbackId = parseIntegerParam((await params).id)
  if (feedbackId === null) return jsonError('Invalid feedback id', 400)

  const body = (await request.json().catch(() => null)) as {
    status?: unknown
  } | null

  if (!body || !isFeedbackStatus(body.status)) {
    return jsonError('Invalid status', 400)
  }

  try {
    await setFeedbackStatus(feedbackId, body.status)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return routeError(err, {
      label: '[feedback] status update',
      fallback: 'Failed to update feedback',
    })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminSession())) return unauthorised()

  const feedbackId = parseIntegerParam((await params).id)
  if (feedbackId === null) return jsonError('Invalid feedback id', 400)

  try {
    await deleteFeedback(feedbackId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return routeError(err, {
      label: '[feedback] delete',
      fallback: 'Failed to delete feedback',
    })
  }
}
