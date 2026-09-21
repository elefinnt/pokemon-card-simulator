import type { PackDef } from '@/lib/packs'
import { cn } from '@/lib/utils'

export interface CollectionSetOption {
  pack: PackDef
  uniqueOwned: number
}

export function CollectionSetFilter({
  options,
  value,
  onChange,
}: {
  options: CollectionSetOption[]
  value: string
  onChange: (setId: string) => void
}) {
  if (options.length === 0) return null

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Filter by set
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-border bg-card py-2.5 pl-3 pr-8 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All sets</option>
          {options.map(({ pack, uniqueOwned }) => (
            <option key={pack.id} value={pack.id}>
              {pack.name}
              {uniqueOwned > 0 ? ` (${uniqueOwned})` : ''}
            </option>
          ))}
        </select>
      </label>

      {options.length > 1 && (
        <div
          role="tablist"
          aria-label="Jump to a set"
          className="flex max-w-full gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <SetChip
            label="All"
            active={value === 'all'}
            onClick={() => onChange('all')}
          />
          {options.map(({ pack }) => (
            <SetChip
              key={pack.id}
              label={pack.name}
              symbol={pack.symbol}
              active={value === pack.id}
              onClick={() => onChange(pack.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SetChip({
  label,
  symbol,
  active,
  onClick,
}: {
  label: string
  symbol?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {symbol ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={symbol}
          alt=""
          aria-hidden="true"
          className="size-3.5 object-contain"
        />
      ) : null}
      {label}
    </button>
  )
}
