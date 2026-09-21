'use client'

import { useMemo, useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { CollectionData } from '@/lib/collection'
import type { MyProfile, ProfileActionResult } from '@/lib/profile'
import { SHOWCASE_MAX, type ShowcaseCard } from '@/lib/profile-types'
import {
  DEFAULT_FILTERS,
  type ShowcaseFilters,
  filterShowcaseCards,
} from '@/lib/showcase-filters'
import { addCardId, moveItem, removeCardId } from '@/lib/showcase-order'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ShowcaseFilterBar } from './showcase-filter-bar'
import { ShowcaseEditStrip } from './showcase-edit-strip'
import { ShowcasePicker } from './showcase-picker'

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
  const [filters, setFilters] = useState<ShowcaseFilters>(DEFAULT_FILTERS)
  const [pickingIndex, setPickingIndex] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [status, setStatus] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

  const cards = useMemo(
    () => Object.values(collection.cards),
    [collection],
  )

  const filtered = useMemo(
    () => filterShowcaseCards(cards, filters),
    [cards, filters],
  )

  const previewCards = useMemo(() => {
    const fromCollection = collection.cards
    const fromProfile = new Map(profile.showcase.map((c) => [c.id, c]))
    return selected
      .map((id): ShowcaseCard | undefined => {
        const owned = fromCollection[id]
        if (owned) return owned
        return fromProfile.get(id)
      })
      .filter((c): c is ShowcaseCard => Boolean(c))
  }, [selected, collection, profile.showcase])

  const savedIds = profile.showcase.map((c) => c.id).slice(0, SHOWCASE_MAX)
  const dirty = selected.join('\0') !== savedIds.join('\0')

  const markDirty = () => {
    setSaved(false)
    setError(null)
  }

  const focusPicker = (index: number) => {
    setPickingIndex((prev) => (prev === index ? null : index))
    pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const add = (id: string) => {
    markDirty()
    setSelected((prev) => {
      const next = addCardId(prev, id, SHOWCASE_MAX)
      if (next !== prev) {
        const name = collection.cards[id]?.name ?? 'Card'
        setStatus(`Added ${name} to your showcase.`)
      }
      return next
    })
    setPickingIndex(null)
  }

  const remove = (id: string) => {
    markDirty()
    setSelected((prev) => removeCardId(prev, id))
    const name = collection.cards[id]?.name ?? 'Card'
    setStatus(`Removed ${name} from your showcase.`)
    setPickingIndex(null)
  }

  const reorder = (from: number, to: number) => {
    markDirty()
    setSelected((prev) => {
      const next = moveItem(prev, from, to)
      if (next !== prev) setStatus('Showcase order updated.')
      return next
    })
    setPickingIndex(null)
  }

  const save = async () => {
    setBusy(true)
    setError(null)
    const result = await onSave(selected)
    setBusy(false)
    if (result.ok) {
      setSaved(true)
      setStatus('Showcase saved.')
      setTimeout(() => setSaved(false), 2000)
    } else {
      setError(result.error ?? 'Could not save your showcase.')
    }
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Open some packs first, then pick your favourites to showcase.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4 font-semibold')}
        >
          Browse packs
        </Link>
      </div>
    )
  }

  const atLimit = selected.length >= SHOWCASE_MAX
  const picking = pickingIndex !== null && !atLimit

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-end justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your showcase
          </p>
          <p className="text-xs font-semibold text-muted-foreground">
            {selected.length}/{SHOWCASE_MAX} cards
          </p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Add up to {SHOWCASE_MAX} favourites. Remove a card with the cross.
          Reorder with the arrows, or drag on a computer.
        </p>
        <div className="mt-3">
          <ShowcaseEditStrip
            cards={previewCards}
            pickingIndex={picking ? pickingIndex : null}
            onAddSlot={focusPicker}
            onRemove={remove}
            onReorder={reorder}
          />
        </div>
      </div>

      <div ref={pickerRef} className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {picking
              ? 'Pick a card for the empty slot'
              : atLimit
                ? 'Showcase is full'
                : 'Add from your collection'}
          </p>
          <p className="text-xs text-muted-foreground">
            {atLimit
              ? 'Remove a card above if you want to add a different one.'
              : picking
                ? 'Tap a card below to fill the highlighted slot.'
                : 'Tap a card to add it. Cards already in your showcase stay marked so they are easy to spot.'}
          </p>
        </div>
        <ShowcaseFilterBar
          cards={cards}
          filters={filters}
          onChange={setFilters}
        />
        <ShowcasePicker
          cards={filtered}
          selectedIds={selected}
          picking={picking}
          onAdd={add}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        {status}
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        {dirty && !saved && (
          <span className="text-sm text-muted-foreground">Unsaved changes</span>
        )}
        {saved && (
          <span className="flex items-center gap-1 text-sm text-primary">
            <Check className="size-4" />
            Saved
          </span>
        )}
        <Button
          onClick={save}
          disabled={busy || !dirty}
          className="font-semibold"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          Save showcase
        </Button>
      </div>
    </div>
  )
}
