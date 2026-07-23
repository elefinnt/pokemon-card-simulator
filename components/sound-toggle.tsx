'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSoundSettings } from '@/hooks/use-sound-settings'

export function SoundToggle() {
  const { muted, toggleMuted } = useSoundSettings()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleMuted}
      aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
      aria-pressed={muted}
      title={muted ? 'Sound off' : 'Sound on'}
    >
      {muted ? (
        <VolumeX className="size-4 text-muted-foreground" />
      ) : (
        <Volume2 className="size-4" />
      )}
    </Button>
  )
}
