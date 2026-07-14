import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function initials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}

export function FriendAvatar({
  name,
  image,
  size = 'default',
}: {
  name: string | null
  image: string | null
  size?: 'default' | 'sm' | 'lg'
}) {
  return (
    <Avatar size={size}>
      {image && <AvatarImage src={image} alt={name ?? 'Player'} />}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  )
}
