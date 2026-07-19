'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import posthog from 'posthog-js'
import type { MyProfile, ProfileActionResult } from '@/lib/profile'
import {
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
} from '@/lib/profile-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AccentPicker } from './accent-picker'

export function ProfileDetailsForm({
  profile,
  fallbackName,
  onSave,
}: {
  profile: MyProfile
  fallbackName: string | null | undefined
  onSave: (input: {
    displayName: string | null
    bio: string | null
    accent: string
  }) => Promise<ProfileActionResult>
}) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [accent, setAccent] = useState(profile.accent)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setSaved(false)
    const result = await onSave({
      displayName: displayName.trim() ? displayName.trim() : null,
      bio: bio.trim() ? bio.trim() : null,
      accent,
    })
    setBusy(false)
    if (result.ok) {
      posthog.capture('profile_saved', {
        has_display_name: displayName.trim().length > 0,
        has_bio: bio.trim().length > 0,
        accent,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setError(result.error ?? 'Could not save your profile.')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label
          htmlFor="display-name"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Display name
        </label>
        <Input
          id="display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={fallbackName ?? 'Choose a name'}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          autoComplete="off"
          className="mt-2 h-10"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Shown to friends in place of your Discord name.
        </p>
      </div>

      <div>
        <label
          htmlFor="bio"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={BIO_MAX_LENGTH}
          rows={3}
          placeholder="Tell other collectors a little about yourself…"
          className="mt-2 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {bio.length}/{BIO_MAX_LENGTH}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Accent colour
        </p>
        <div className="mt-2">
          <AccentPicker value={accent} onChange={setAccent} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-primary">
            <Check className="size-4" />
            Saved
          </span>
        )}
        <Button type="submit" disabled={busy} className="font-semibold">
          {busy && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  )
}
