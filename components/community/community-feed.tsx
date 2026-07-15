'use client'

import { Radio } from 'lucide-react'
import { SignInPrompt } from '@/components/sign-in-prompt'
import { useCommunityFeed } from '@/lib/community/feed'
import { FeedEventCard } from './feed-event'

export function CommunityFeed({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean
}) {
  const { events, loading, error, react } = useCommunityFeed(isAuthenticated)

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          <Radio className="size-3.5 animate-pulse" />
          Live · last hour
        </span>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-foreground">
          Community pulls
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {events.length > 0
            ? `${events.length} pack${events.length === 1 ? '' : 's'} opened in the last hour. React to the best hits.`
            : 'Recent pack openings from across PackRip.'}
        </p>
      </div>

      {!isAuthenticated && (
        <SignInPrompt
          variant="banner"
          title="Join the hype"
          description="Sign in with Discord to react to other players' pulls."
        />
      )}

      {error && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-foreground">
          {error}
        </p>
      )}

      {loading && events.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Loading the feed…
        </p>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
          <p className="font-display text-base font-extrabold text-foreground">
            Nothing opened in the last hour
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Rip a pack and you&apos;ll be the first on the board.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <FeedEventCard
              key={event.id}
              event={event}
              reacted={event.myReaction}
              canReact={isAuthenticated}
              onReact={(key) => react(event.id, key)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
