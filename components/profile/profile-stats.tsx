import { Layers, Sparkles, Star } from 'lucide-react'
import type { ProfileStats as Stats } from '@/lib/profile-types'

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-GB').format(value)
}

const ITEMS: {
  key: keyof Stats
  label: string
  icon: typeof Layers
}[] = [
  { key: 'totalPacksOpened', label: 'Packs', icon: Layers },
  { key: 'uniqueOwned', label: 'Unique', icon: Star },
  { key: 'totalCardsPulled', label: 'Pulled', icon: Sparkles },
]

export function ProfileStats({ stats }: { stats: Stats }) {
  return (
    <dl className="grid grid-cols-3 gap-2">
      {ITEMS.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="rounded-xl border border-border bg-background/50 px-3 py-2.5 text-center"
        >
          <dt className="flex items-center justify-center gap-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
            <Icon className="size-3" />
            {label}
          </dt>
          <dd className="mt-1 font-display text-xl font-black text-foreground">
            {formatNumber(stats[key])}
          </dd>
        </div>
      ))}
    </dl>
  )
}
