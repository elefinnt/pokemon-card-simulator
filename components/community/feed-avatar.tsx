import type { FeedUser } from '@/lib/community/types'

function hueFrom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 360
  }
  return hash
}

export function FeedAvatar({ user }: { user: FeedUser }) {
  const name = user.name ?? 'Player'
  const initials = name.slice(0, 2).toUpperCase()
  const hue = hueFrom(user.id || name)

  if (user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={name}
        className="size-9 shrink-0 rounded-full object-cover"
        loading="lazy"
      />
    )
  }

  return (
    <div
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{
        background: `linear-gradient(140deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 70% 40%))`,
      }}
    >
      {initials}
    </div>
  )
}
