'use client'

import { useMemo, useState } from 'react'
import {
  Bug,
  Lightbulb,
  Loader2,
  Mail,
  MailX,
  MessageCircle,
  PackagePlus,
  Trash2,
} from 'lucide-react'
import {
  type FeedbackCategory,
  type FeedbackEntry,
  type FeedbackStatus,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUSES,
} from '@/lib/feedback-types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const CATEGORY_ICONS: Record<FeedbackCategory, typeof Bug> = {
  pack: PackagePlus,
  bug: Bug,
  idea: Lightbulb,
  other: MessageCircle,
}

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  done: 'Done',
}

const STATUS_STYLES: Record<FeedbackStatus, string> = {
  new: 'border-primary/40 bg-primary/10 text-primary',
  reviewed: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  done: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
}

type Filter = 'all' | FeedbackStatus

export function FeedbackAdminList({
  initialEntries,
}: {
  initialEntries: FeedbackEntry[]
}) {
  const [entries, setEntries] = useState(initialEntries)
  const [filter, setFilter] = useState<Filter>('all')
  const [busyId, setBusyId] = useState<number | null>(null)

  const counts = useMemo(() => {
    const byStatus = { new: 0, reviewed: 0, done: 0 }
    for (const entry of entries) byStatus[entry.status] += 1
    return byStatus
  }, [entries])

  const visible =
    filter === 'all' ? entries : entries.filter((e) => e.status === filter)

  const updateStatus = async (id: number, status: FeedbackStatus) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status } : e)),
        )
      }
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this feedback permanently?')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id))
      }
    } finally {
      setBusyId(null)
    }
  }

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: `All (${entries.length})` },
    { value: 'new', label: `New (${counts.new})` },
    { value: 'reviewed', label: `Reviewed (${counts.reviewed})` },
    { value: 'done', label: `Done (${counts.done})` },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              filter === option.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          {entries.length === 0
            ? 'No feedback yet. It will show up here as soon as someone submits.'
            : 'Nothing matches this filter.'}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((entry) => (
            <FeedbackRow
              key={entry.id}
              entry={entry}
              busy={busyId === entry.id}
              onStatusChange={(status) => updateStatus(entry.id, status)}
              onDelete={() => remove(entry.id)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function FeedbackRow({
  entry,
  busy,
  onStatusChange,
  onDelete,
}: {
  entry: FeedbackEntry
  busy: boolean
  onStatusChange: (status: FeedbackStatus) => void
  onDelete: () => void
}) {
  const Icon = CATEGORY_ICONS[entry.category] ?? MessageCircle
  const categoryLabel =
    FEEDBACK_CATEGORY_LABELS[entry.category] ?? entry.category
  const submitted = new Date(entry.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <Icon className="size-3.5" />
          {categoryLabel}
        </span>
        <span
          className={cn(
            'rounded-full border px-2.5 py-1 text-xs font-medium',
            STATUS_STYLES[entry.status],
          )}
        >
          {STATUS_LABELS[entry.status]}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {submitted}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
        {entry.message}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          From: {entry.user ? (entry.user.name ?? 'Unknown') : 'Anonymous visitor'}
        </span>
        {entry.contactOk ? (
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <Mail className="size-3.5" />
            Happy to be contacted
            {entry.email && (
              <a
                href={`mailto:${entry.email}`}
                className="font-normal text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {entry.email}
              </a>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <MailX className="size-3.5" />
            No follow-up
          </span>
        )}
        {entry.page && <span>Page: {entry.page}</span>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {FEEDBACK_STATUSES.filter((s) => s !== entry.status).map((status) => (
          <Button
            key={status}
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => onStatusChange(status)}
          >
            Mark as {STATUS_LABELS[status].toLowerCase()}
          </Button>
        ))}
        <Button
          variant="destructive"
          size="sm"
          disabled={busy}
          onClick={onDelete}
          className="ml-auto"
        >
          {busy ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          Delete
        </Button>
      </div>
    </li>
  )
}
