'use client'

import { useSession } from 'next-auth/react'
import { Cloud, Gift, HardDrive } from 'lucide-react'
import { useFreePacks } from '@/lib/free-packs'

export function CollectionStatus() {
  const { data: session, status } = useSession()
  const free = useFreePacks()

  if (status === 'loading') return null

  if (session?.user) {
    return (
      <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Cloud className="size-3.5" />
        Collection synced to your account
      </p>
    )
  }

  if (!free.exhausted) {
    return (
      <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Gift className="size-3.5 text-primary" />
        {free.remaining} free {free.remaining === 1 ? 'pack' : 'packs'} to open ·
        sign in free for unlimited packs and to save your collection
      </p>
    )
  }

  return (
    <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
      <HardDrive className="size-3.5" />
      Sign in free for unlimited packs and to save your collection
    </p>
  )
}
