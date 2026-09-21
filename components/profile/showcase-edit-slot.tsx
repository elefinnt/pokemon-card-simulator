'use client'

import type { DragEvent, KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, GripVertical, Plus, Sparkles, X } from 'lucide-react'
import type { ShowcaseCard } from '@/lib/profile-types'
import { TradeCardThumb } from '@/components/trades/trade-card-thumb'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ShowcaseEditSlot({
  card,
  index,
  total,
  picking,
  addable,
  dragging,
  dropTarget,
  onAdd,
  onRemove,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  card?: ShowcaseCard
  index: number
  total: number
  picking: boolean
  addable: boolean
  dragging: boolean
  dropTarget: boolean
  onAdd: () => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
  onDragStart: (event: DragEvent) => void
  onDragOver: (event: DragEvent) => void
  onDrop: (event: DragEvent) => void
  onDragEnd: () => void
}) {
  const slotLabel = `Slot ${index + 1}`

  if (!card) {
    return (
      <div className="min-w-0">
        {addable ? (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add a card to ${slotLabel.toLowerCase()}`}
            className={cn(
              'flex aspect-[2.5/3.5] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-card/40 text-muted-foreground transition-colors',
              picking
                ? 'border-primary bg-primary/5 text-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                : 'border-border hover:border-primary hover:bg-primary/5 hover:text-foreground',
            )}
          >
            <Plus className="size-5" />
            <span className="px-1 text-center text-[0.7rem] font-semibold leading-tight">
              Add card
            </span>
          </button>
        ) : (
          <div className="flex aspect-[2.5/3.5] items-center justify-center rounded-lg border border-dashed border-border bg-card/40 text-muted-foreground/50">
            <Sparkles className="size-5" />
          </div>
        )}
        <p className="mt-1.5 truncate text-center text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
          {slotLabel}
        </p>
      </div>
    )
  }

  const canMoveLeft = index > 0
  const canMoveRight = index < total - 1

  return (
    <div
      className={cn(
        'min-w-0 rounded-xl transition-shadow',
        dropTarget && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        dragging && 'opacity-45',
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div
        className="relative rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        tabIndex={0}
        aria-label={`${card.name}, ${slotLabel.toLowerCase()} of ${total}. Use arrow keys to reorder, Delete to remove.`}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            onMove(-1)
          } else if (event.key === 'ArrowRight') {
            event.preventDefault()
            onMove(1)
          } else if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault()
            onRemove()
          }
        }}
      >
        <TradeCardThumb card={card} className="pointer-events-none" />
        <span className="absolute left-1 top-1 rounded-md bg-background/90 px-1.5 py-0.5 text-[0.65rem] font-black text-foreground shadow-sm">
          {index + 1}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="icon-xs"
          onClick={onRemove}
          aria-label={`Remove ${card.name} from showcase`}
          className="absolute right-1 top-1 size-7 rounded-full border border-border bg-background/95 shadow-sm"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      <p className="mt-1.5 truncate text-center text-[0.7rem] font-semibold text-foreground">
        {card.name}
      </p>

      <div className="mt-1 flex items-center justify-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={!canMoveLeft}
          onClick={() => onMove(-1)}
          aria-label={`Move ${card.name} left`}
        >
          <ChevronLeft />
        </Button>
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          aria-label={`Drag to move ${card.name}`}
          title="Drag to reorder"
          className="hidden size-7 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing [@media(hover:hover)_and_(pointer:fine)]:flex"
        >
          <GripVertical className="size-3.5" />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={!canMoveRight}
          onClick={() => onMove(1)}
          aria-label={`Move ${card.name} right`}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
