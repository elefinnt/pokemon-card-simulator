'use client'

import { Globe, Layers, LibraryBig, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export type View = 'packs' | 'collection' | 'community' | 'friends'

const TABS: {
  id: View
  label: string
  icon: typeof Layers
  authOnly?: boolean
}[] = [
  { id: 'packs', label: 'Open packs', icon: Layers },
  { id: 'collection', label: 'Collection', icon: LibraryBig },
  { id: 'community', label: 'Community', icon: Globe },
  { id: 'friends', label: 'Friends', icon: Users, authOnly: true },
]

export function ViewTabs({
  view,
  onChange,
  isAuthenticated = false,
}: {
  view: View
  onChange: (view: View) => void
  isAuthenticated?: boolean
}) {
  const tabs = TABS.filter((tab) => !tab.authOnly || isAuthenticated)

  return (
    <div
      role="tablist"
      aria-label="View"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
    >
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          role="tab"
          aria-selected={view === id}
          onClick={() => onChange(id)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
            view === id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
