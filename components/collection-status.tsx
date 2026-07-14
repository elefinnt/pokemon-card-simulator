'use client'

import { useSession } from 'next-auth/react'
import { Cloud, HardDrive } from 'lucide-react'

export function CollectionStatus() {
  const { data: session, status } = useSession()

  if (status === 'loading') return null

  if (session?.user) {
    return (
      <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Cloud className="size-3.5" />
        Collection synced to your account
      </p>
    )
  }

  return (
    <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
      <HardDrive className="size-3.5" />
      Sign in with Discord to open packs and save your collection
    </p>
  )
}
