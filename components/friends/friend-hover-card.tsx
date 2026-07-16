'use client'

import type { ReactNode } from 'react'
import type { Friend } from '@/lib/friends'
import { accentColor, resolveDisplayName } from '@/lib/profile-types'
import { UserAvatar } from '@/components/user-avatar'
import { ShowcaseStrip } from '@/components/profile/showcase-strip'

/**
 * Wraps a trigger (avatar + name) and reveals a rich, clickable preview of the
 * friend on hover or keyboard focus. Pure CSS visibility — no popover library.
 *
 * The preview sits directly against the trigger (no margin gap) with an
 * internal `pt-2` bridge, so the pointer never crosses a dead zone on its way
 * into the card; that dead zone was what made the preview vanish on approach.
 */
export function FriendHoverCard({
  friend,
  onOpen,
  children,
}: {
  friend: Friend
  onOpen: () => void
  children: ReactNode
}) {
  const color = accentColor(friend.accent)
  const name = resolveDisplayName(friend.displayName, friend.name)
  const showcase = friend.showcase ?? []

  return (
    <div className="group/hover relative">
      {children}

      <div className="pointer-events-none absolute left-0 top-full z-30 w-72 origin-top-left scale-95 pt-2 opacity-0 transition-all duration-150 group-hover/hover:pointer-events-auto group-hover/hover:scale-100 group-hover/hover:opacity-100 group-focus-within/hover:pointer-events-auto group-focus-within/hover:scale-100 group-focus-within/hover:opacity-100">
        <div
          role="button"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onOpen()
            }
          }}
          aria-label={`View ${name}'s profile`}
          className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-card text-left shadow-2xl transition-shadow hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div
            className="h-10"
            style={{
              background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 30%, transparent))`,
            }}
          />
          <div className="px-4 pb-4">
            <div className="-mt-6 flex items-end gap-2">
              <UserAvatar
                name={name}
                image={friend.image}
                size="lg"
                accent={color}
              />
              <div className="min-w-0 pb-0.5">
                <p className="truncate font-display text-sm font-extrabold text-foreground">
                  {name}
                </p>
                {friend.friendCode && (
                  <p className="truncate font-mono text-[0.65rem] tracking-widest text-muted-foreground">
                    {friend.friendCode}
                  </p>
                )}
              </div>
            </div>

            {friend.bio && (
              <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {friend.bio}
              </p>
            )}

            {showcase.length > 0 && (
              <div className="pointer-events-none mt-3">
                <ShowcaseStrip cards={showcase} showPlaceholders={false} />
              </div>
            )}

            <p className="mt-3 text-center text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground/70">
              View full profile
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
