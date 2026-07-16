'use client'

import { useEffect, useState } from 'react'
import { ArrowRightLeft, Loader2, Pencil } from 'lucide-react'
import { fetchPublicProfile } from '@/lib/profile'
import type { PublicProfile } from '@/lib/profile-types'
import { Button } from '@/components/ui/button'
import { ModalShell } from '@/components/modal-shell'
import { ProfileCard } from './profile-card'

export function PublicProfileModal({
  userId,
  onClose,
  onTrade,
  onEdit,
}: {
  userId: string
  onClose: () => void
  /** Called when the viewer wants to trade with this (non-self) player. */
  onTrade?: (profile: PublicProfile) => void
  /** Called when the viewer opens their own profile for editing. */
  onEdit?: () => void
}) {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchPublicProfile(userId)
      .then((data) => {
        if (cancelled) return
        if (data) setProfile(data)
        else setError('Could not load this profile.')
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this profile.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const footer = profile ? (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" size="sm" onClick={onClose}>
        Close
      </Button>
      {profile.isSelf
        ? onEdit && (
            <Button size="sm" onClick={onEdit}>
              <Pencil className="size-4" />
              Edit profile
            </Button>
          )
        : onTrade && (
            <Button size="sm" onClick={() => onTrade(profile)}>
              <ArrowRightLeft className="size-4" />
              Propose trade
            </Button>
          )}
    </div>
  ) : undefined

  return (
    <ModalShell
      title="Profile"
      onClose={onClose}
      maxWidthClassName="max-w-md"
      footer={footer}
    >
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : error ? (
        <p className="py-12 text-center text-sm text-destructive">{error}</p>
      ) : profile ? (
        <ProfileCard profile={profile} />
      ) : null}
    </ModalShell>
  )
}
