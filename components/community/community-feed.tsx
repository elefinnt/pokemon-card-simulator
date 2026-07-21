'use client'

import { Radio, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignInPrompt } from '@/components/sign-in-prompt'
import { openSignIn } from '@/lib/sign-in-dialog'
import { useCommunityFeed } from '@/lib/community/feed'
import type { ReactionKey } from '@/lib/community/types'
import { FeedEventCard } from './feed-event'

export function CommunityFeed({
  isAuthenticated = false,
  onAddFriends,
}: {
  isAuthenticated?: boolean
  onAddFriends?: () => void
}) {
  const { events, loading, error, react } = useCommunityFeed(isAuthenticated)

  // When signed out we show a mocked preview; trying to react nudges sign-in.
  const handleReact = (openingId: number, key: ReactionKey) => {
    if (!isAuthenticated) {
      openSignIn()
      return
    }
    react(openingId, key)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          <Radio className="size-3.5 animate-pulse" />
          {isAuthenticated ? 'Friends · last hour' : 'Friends · last hour'}
        </span>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-foreground">
          {isAuthenticated ? 'Friends pulls' : 'Community pulls'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAuthenticated
            ? events.length > 0
              ? `${events.length} pack${events.length === 1 ? '' : 's'} opened by you and your friends in the last hour. React to the best hits.`
              : 'Pack openings from you and your friends appear here.'
            : 'Sign in to follow your own friends.'}
        </p>
      </div>

      {!isAuthenticated && (
        <SignInPrompt
          variant="banner"
          title="See your friends' pulls"
          description="Sign in to build a friends list and watch their pack openings roll in live."
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
            No friend activity yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add friends to see their pack openings here, or rip a pack yourself
            to kick things off.
          </p>
          {onAddFriends && (
            <Button onClick={onAddFriends} className="mt-5 font-semibold">
              <UserPlus className="size-4" />
              Add friends
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <FeedEventCard
              key={event.id}
              event={event}
              reacted={event.myReaction}
              canReact={isAuthenticated}
              onReact={(key) => handleReact(event.id, key)}
            />
          ))}
        </div>
      )}

      {!isAuthenticated && events.length > 0 && (
        <SignInPrompt
          variant="compact"
          className="pt-2"
          description="Like what you see? Sign in to react and follow your friends' pulls."
        />
      )}
    </div>
  )
}
