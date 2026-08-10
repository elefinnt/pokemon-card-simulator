'use client'

import { useState } from 'react'
import { Globe, Radio, UserPlus, Users } from 'lucide-react'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button'
import { SignInPrompt } from '@/components/sign-in-prompt'
import { cn } from '@/lib/utils'
import { openSignIn } from '@/lib/sign-in-dialog'
import { useCommunityFeed, type FeedScope } from '@/lib/community/feed'
import type { ReactionKey } from '@/lib/community/types'
import type { PackDef } from '@/lib/packs'
import { FeedEventCard } from './feed-event'

const SCOPES: { id: FeedScope; label: string; icon: typeof Users }[] = [
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'global', label: 'Global', icon: Globe },
]

export function CommunityFeed({
  packs,
  isAuthenticated = false,
  onAddFriends,
}: {
  packs: PackDef[]
  isAuthenticated?: boolean
  onAddFriends?: () => void
}) {
  // Friends is the home feed for signed-in players; guests have no friends,
  // so they land on the (busier) global feed instead.
  const [scope, setScope] = useState<FeedScope>(
    isAuthenticated ? 'friends' : 'global',
  )
  const { events, loading, error, react } = useCommunityFeed(
    isAuthenticated,
    scope,
    packs,
  )

  const changeScope = (next: FeedScope) => {
    if (next === scope) return
    posthog.capture('community_scope_changed', { scope: next })
    setScope(next)
  }

  // Reacting while signed out nudges sign-in instead.
  const handleReact = (openingId: number, key: ReactionKey) => {
    if (!isAuthenticated) {
      openSignIn()
      return
    }
    react(openingId, key)
  }

  const friendsScope = scope === 'friends'

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          <Radio className="size-3.5 animate-pulse" />
          {friendsScope ? 'Friends · last hour' : 'Global · last hour'}
        </span>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-foreground">
          {friendsScope ? 'Friends pulls' : 'Community pulls'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {friendsScope
            ? isAuthenticated
              ? events.length > 0
                ? `${events.length} pack${events.length === 1 ? '' : 's'} opened by you and your friends in the last hour. React to the best hits.`
                : 'Pack openings from you and your friends appear here.'
              : 'Sign in to follow your own friends.'
            : 'Pack openings from collectors everywhere — react to the best hits.'}
        </p>
      </div>

      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Feed scope"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
        >
          {SCOPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={scope === id}
              onClick={() => changeScope(id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-sm font-semibold transition-colors',
                scope === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {!isAuthenticated && friendsScope && (
        <SignInPrompt
          variant="banner"
          title="See your friends' pulls"
          description="Sign in to build a friends list and watch their pack openings roll in live."
        />
      )}

      {error && friendsScope && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-foreground">
          {error}
        </p>
      )}

      {loading && events.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Loading the feed…
        </p>
      ) : events.length === 0 ? (
        friendsScope ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
            <p className="font-display text-base font-extrabold text-foreground">
              No friend activity yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAuthenticated
                ? 'Add friends to see their pack openings here, or rip a pack yourself to kick things off.'
                : 'Sign in and add friends to see their pack openings here.'}
            </p>
            {isAuthenticated && onAddFriends && (
              <Button onClick={onAddFriends} className="mt-5 font-semibold">
                <UserPlus className="size-4" />
                Add friends
              </Button>
            )}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            The global feed is quiet right now — rip a pack to get it going.
          </p>
        )
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
          description="Like what you see? Sign in to react and share your own pulls with friends."
        />
      )}
    </div>
  )
}
