'use client'

import { FeedbackDialogHost } from './feedback-dialog'
import { FeedbackFab } from './feedback-fab'
import { FeedbackNudge } from './feedback-nudge'

/** Global feedback chrome: corner button, occasional nudge, and the dialog. */
export function FeedbackWidget() {
  return (
    <>
      <FeedbackFab />
      <FeedbackNudge />
      <FeedbackDialogHost />
    </>
  )
}
