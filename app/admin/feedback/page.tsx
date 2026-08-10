import { notFound } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { FeedbackAdminList } from '@/components/admin/feedback-admin-list'
import { isAdminSession } from '@/lib/admin'
import { listFeedback } from '@/lib/feedback-db'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Feedback admin',
  robots: { index: false, follow: false },
}

/** Owner-only feedback inbox. Non-admins get a 404 so the page stays hidden. */
export default async function FeedbackAdminPage() {
  if (!(await isAdminSession())) {
    notFound()
  }

  const entries = await listFeedback()

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Feedback inbox
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything visitors have submitted, newest first.
        </p>

        <div className="mt-6">
          <FeedbackAdminList initialEntries={entries} />
        </div>
      </div>
    </PageShell>
  )
}
