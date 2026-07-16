import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

function initials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}

/**
 * Shared avatar used across friends, profiles and the header. An optional
 * `accent` draws a coloured ring so a player's chosen colour reads at a glance.
 */
export function UserAvatar({
  name,
  image,
  size = 'default',
  accent,
  className,
}: {
  name: string | null | undefined
  image: string | null | undefined
  size?: 'default' | 'sm' | 'lg'
  accent?: string
  className?: string
}) {
  return (
    <Avatar
      size={size}
      className={cn(className)}
      style={
        accent
          ? {
              boxShadow: `0 0 0 2px var(--card), 0 0 0 4px ${accent}`,
            }
          : undefined
      }
    >
      {image && <AvatarImage src={image} alt={name ?? 'Player'} />}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  )
}
