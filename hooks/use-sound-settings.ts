'use client'

import { useEffect, useState } from 'react'
import {
  isSoundMuted,
  setSoundMuted,
  subscribeSoundSettings,
} from '@/lib/sounds'

export function useSoundSettings() {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    setMuted(isSoundMuted())
    return subscribeSoundSettings(() => setMuted(isSoundMuted()))
  }, [])

  const toggleMuted = () => setSoundMuted(!isSoundMuted())

  return { muted, toggleMuted, setMuted: setSoundMuted }
}
