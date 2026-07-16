'use client'

import type { PublicProfile } from '@/lib/profile-types'
import { accentColor, resolveDisplayName } from '@/lib/profile-types'
import { UserAvatar } from '@/components/user-avatar'
import { ProfileStats } from './profile-stats'
import { ShowcaseStrip } from './showcase-strip'

/**
 * The presentational body of a player's profile: accent banner, identity, bio,
 * stats and showcase. Shared by the public-profile modal and previews.
 */
export function ProfileCard({ profile }: { profile: PublicProfile }) {
  const color = accentColor(profile.accent)
  const name = resolveDisplayName(profile.displayName, profile.name)
  const showSecondary =
    !!profile.displayName && profile.displayName !== profile.name && !!profile.name

  return (
    <div>
      <div
        className="relative h-24 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 35%, transparent))`,
        }}
      >
        <div className="absolute -bottom-8 left-5">
          <UserAvatar
            name={name}
            image={profile.image}
            size="lg"
            accent={color}
            className="size-16"
          />
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <div>
          <h3 className="font-display text-xl font-black text-foreground">
            {name}
          </h3>
          {showSecondary && (
            <p className="text-sm text-muted-foreground">{profile.name}</p>
          )}
          {profile.friendCode && (
            <p className="mt-1 font-mono text-xs tracking-widest text-muted-foreground">
              {profile.friendCode}
            </p>
          )}
        </div>

        {profile.bio && (
          <p className="text-pretty text-sm leading-relaxed text-foreground/90">
            {profile.bio}
          </p>
        )}

        <ProfileStats stats={profile.stats} />

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Showcase
          </p>
          <ShowcaseStrip
            cards={profile.showcase}
            emptyLabel={
              profile.isSelf
                ? 'Add up to three favourite cards to your showcase.'
                : 'This player has not showcased any cards yet.'
            }
          />
        </div>
      </div>
    </div>
  )
}
