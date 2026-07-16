import { UserAvatar } from '@/components/user-avatar'

export function FriendAvatar({
  name,
  image,
  size = 'default',
  accent,
}: {
  name: string | null
  image: string | null
  size?: 'default' | 'sm' | 'lg'
  accent?: string
}) {
  return <UserAvatar name={name} image={image} size={size} accent={accent} />
}
