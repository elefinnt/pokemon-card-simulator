'use client'

import { useSyncExternalStore } from 'react'
import {
  THEMES,
  getServerTheme,
  getTheme,
  setTheme,
  subscribeTheme,
} from '@/lib/theme'

export function ThemeSelect() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme)

  return (
    <select
      aria-label="Site theme"
      title="Site theme"
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="theme-select h-8 max-w-[9.5rem] cursor-pointer rounded-lg border border-border bg-card px-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {THEMES.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
