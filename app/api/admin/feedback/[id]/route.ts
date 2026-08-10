import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin'
import { deleteFeedback, setFeedbackStatus } from '@/lib/feedback-db'
import { isFeedbackStatus } from '@/lib/feedback-types'

export const dynamic = 'force-dynamic'

async function parseId(params: Promise<{ id: string }>) {
  const { id } = await params
  const feedbackId = Number(id)
  return Number.isInteger(feedbackId) ? feedbackId : null
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const feedbackId = await parseId(params)
  if (feedbackId === null) {
    return NextResponse.json({ error: 'Invalid feedback id' }, { status: 400 })
  }

  const body = (await request.json().catch(() => null)) as {
    status?: unknown
  } | null

  if (!body || !isFeedbackStatus(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  try {
    await setFeedbackStatus(feedbackId, body.status)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.log(
      '[feedback] status update failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const feedbackId = await parseId(params)
  if (feedbackId === null) {
    return NextResponse.json({ error: 'Invalid feedback id' }, { status: 400 })
  }

  try {
    await deleteFeedback(feedbackId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.log(
      '[feedback] delete failed:',
      err instanceof Error ? err.message : err,
    )
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 },
    )
  }
}
