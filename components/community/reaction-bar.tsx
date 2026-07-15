'use client'

import { cn } from '@/lib/utils'
import {
  REACTIONS,
  type ReactionKey,
  type FeedEvent,
} from '@/lib/community/types'

export function ReactionBar({
  reactions,
  reacted,
  canReact,
  onReact,
}: {
  reactions: FeedEvent['reactions']
  reacted: ReactionKey | null
  canReact: boolean
  onReact: (key: ReactionKey) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {REACTIONS.map(({ key, emoji, label }) => {
        const count = reactions[key]
        const active = reacted === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onReact(key)}
            aria-pressed={active}
            aria-label={label}
            title={canReact ? label : 'Sign in to react'}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
              active
                ? 'border-primary bg-primary/15 text-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
              !canReact && 'cursor-not-allowed opacity-70 hover:text-muted-foreground',
            )}
          >
            <span className="text-sm leading-none">{emoji}</span>
            {count > 0 && <span className="tabular-nums">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
