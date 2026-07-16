'use client'

import { useMemo, useState } from 'react'
import { Check, Loader2, Search } from 'lucide-react'
import type { CollectionData, CollectedCard } from '@/lib/collection'
import type { MyProfile, ProfileActionResult } from '@/lib/profile'
import { SHOWCASE_MAX } from '@/lib/profile-types'
import { Button } from '@/components/ui/button'
import { TradeCardThumb } from '@/components/trades/trade-card-thumb'
import { ShowcaseStrip } from './showcase-strip'
import { cn } from '@/lib/utils'

export function ShowcaseEditor({
  profile,
  collection,
  onSave,
}: {
  profile: MyProfile
  collection: CollectionData
  onSave: (cardIds: string[]) => Promise<ProfileActionResult>
}) {
  const [selected, setSelected] = useState<string[]>(
    profile.showcase.map((c) => c.id).slice(0, SHOWCASE_MAX),
  )
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const cards = useMemo(
    () =>
      Object.values(collection.cards).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [collection],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cards
    return cards.filter((c) => c.name.toLowerCase().includes(q))
  }, [cards, query])

  const previewCards = useMemo(
    () =>
      selected
        .map((id) => collection.cards[id])
        .filter((c): c is CollectedCard => Boolean(c)),
    [selected, collection],
  )

  const toggle = (id: string) => {
    setSaved(false)
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= SHOWCASE_MAX) return prev
      return [...prev, id]
    })
  }

  const save = async () => {
    setBusy(true)
    setError(null)
    const result = await onSave(selected)
    setBusy(false)
    if (result.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setError(result.error ?? 'Could not save your showcase.')
    }
  }

  if (cards.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">
        Open some packs first — then pick your favourites to showcase.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Showcase preview
        </p>
        <div className="mt-2">
          <ShowcaseStrip cards={previewCards} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Pick up to {SHOWCASE_MAX} favourites ({selected.length}/{SHOWCASE_MAX})
        </p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter cards…"
            aria-label="Filter cards"
            className="w-40 rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No cards match that search.
        </p>
      ) : (
        <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
          {filtered.map((card) => {
            const isSelected = selected.includes(card.id)
            const atLimit = selected.length >= SHOWCASE_MAX
            return (
              <div
                key={card.id}
                className={cn(!isSelected && atLimit && 'opacity-50')}
              >
                <TradeCardThumb
                  card={card}
                  quantity={card.count > 1 ? card.count : undefined}
                  selected={isSelected}
                  onClick={() => toggle(card.id)}
                />
              </div>
            )
          })}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-primary">
            <Check className="size-4" />
            Saved
          </span>
        )}
        <Button onClick={save} disabled={busy} className="font-semibold">
          {busy && <Loader2 className="size-4 animate-spin" />}
          Save showcase
        </Button>
      </div>
    </div>
  )
}
