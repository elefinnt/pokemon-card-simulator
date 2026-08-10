'use client'

import { useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { FeedbackDialog } from './feedback-dialog'

/** Footer link that opens the feedback dialog. */
export function FeedbackButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
      >
        <MessageSquarePlus className="size-4" />
        Send feedback
      </button>
      {open && <FeedbackDialog onClose={() => setOpen(false)} />}
    </>
  )
}
