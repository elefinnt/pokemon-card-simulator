'use client'

import { useSyncExternalStore } from 'react'
import { Select } from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'
import {
  THEMES,
  getServerTheme,
  getTheme,
  setTheme,
  subscribeTheme,
} from '@/lib/theme'

const themeOptions = THEMES.map(({ id, label }) => ({ value: id, label }))

export function ThemeSelect() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme)

  return (
    <Select.Root
      value={theme}
      items={themeOptions}
      onValueChange={(value) => { if (value !== null) setTheme(value) }}
      modal={false}
    >
      <Select.Trigger
        aria-label="Site theme"
        title="Site theme"
        className="theme-select inline-flex h-8 min-w-24 max-w-[9.5rem] cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-card px-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[popup-open]:border-ring"
      >
        <Select.Value />
        <Select.Icon className="shrink-0 text-muted-foreground">
          <ChevronDown aria-hidden="true" className="size-3.5" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner align="end" sideOffset={6} alignItemWithTrigger={false} className="z-50 outline-none">
          <Select.Popup className="theme-select-popup min-w-36 max-w-[calc(100vw-1.5rem)] rounded-lg border border-border bg-popover p-1 text-sm text-popover-foreground shadow-xl outline-none">
            <Select.List>
              {themeOptions.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex min-h-9 cursor-pointer items-center gap-2 rounded-md py-2 pr-3 pl-8 outline-none select-none data-[selected]:font-semibold data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                >
                  <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <Check aria-hidden="true" className="size-3.5" />
                  </Select.ItemIndicator>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
