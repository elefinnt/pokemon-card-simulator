'use client'

import { PokeCardFace } from '@/components/poke-card'
import { packLogo } from '@/lib/packs'
import { TIER_META } from '@/lib/rarity'
import type { FeedEvent, ReactionKey } from '@/lib/community/types'
import { FeedAvatar } from './feed-avatar'
import { ReactionBar } from './reaction-bar'

function timeAgo(minutes: number): string {
  if (minutes < 1) return 'just now'
  if (minutes === 1) return '1 min ago'
  return `${minutes} mins ago`
}

const TIER_ORDER = ['ultra', 'rare', 'uncommon', 'common'] as const

export function FeedEventCard({
  event,
  reacted,
  canReact,
  onReact,
}: {
  event: FeedEvent
  reacted: ReactionKey | null
  canReact: boolean
  onReact: (key: ReactionKey) => void
}) {
  const bestMeta = TIER_META[event.bestTier]
  const sorted = [...event.cards].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
  )

  return (
    <article className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <header className="flex items-center gap-3">
        <FeedAvatar user={event.user} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground">
            <span className="font-bold">{event.user.name}</span>
            <span className="text-muted-foreground"> opened </span>
            <span className="font-semibold">{event.packName}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {event.series} Series · {timeAgo(event.minutesAgo)}
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={packLogo(event.packId)}
          alt=""
          className="h-8 w-auto max-w-24 object-contain opacity-90"
          loading="lazy"
        />
      </header>

      <div className="mt-4 flex items-center gap-2">
        <span
          className="inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold"
          style={{
            color: bestMeta.color,
            borderColor: `${bestMeta.color}55`,
            background: `${bestMeta.color}18`,
          }}
        >
          Best pull: {bestMeta.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
        {sorted.map((card, i) => (
          <PokeCardFace
            key={card.id + i}
            card={card}
            showShine={card.tier === 'ultra'}
          />
        ))}
      </div>

      <footer className="mt-4">
        <ReactionBar
          reactions={event.reactions}
          reacted={reacted}
          canReact={canReact}
          onReact={onReact}
        />
      </footer>
    </article>
  )
}
