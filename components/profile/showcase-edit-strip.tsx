'use client'

import { useState } from 'react'
import type { ShowcaseCard } from '@/lib/profile-types'
import { SHOWCASE_MAX } from '@/lib/profile-types'
import { ShowcaseEditSlot } from './showcase-edit-slot'

export function ShowcaseEditStrip({
  cards,
  pickingIndex,
  onAddSlot,
  onRemove,
  onReorder,
}: {
  cards: ShowcaseCard[]
  pickingIndex: number | null
  onAddSlot: (index: number) => void
  onRemove: (id: string) => void
  onReorder: (from: number, to: number) => void
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const clearDrag = () => {
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <div className="grid grid-cols-3 items-start gap-2.5">
      {Array.from({ length: SHOWCASE_MAX }).map((_, index) => {
        const card = cards[index]
        return (
          <ShowcaseEditSlot
            key={card?.id ?? `empty-${index}`}
            card={card}
            index={index}
            total={cards.length}
            picking={pickingIndex === index}
            addable={!card && index === cards.length}
            dragging={dragIndex === index}
            dropTarget={overIndex === index && dragIndex !== null && dragIndex !== index}
            onAdd={() => onAddSlot(index)}
            onRemove={() => {
              if (card) onRemove(card.id)
            }}
            onMove={(direction) => onReorder(index, index + direction)}
            onDragStart={(event) => {
              if (!card) {
                event.preventDefault()
                return
              }
              setDragIndex(index)
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', String(index))
            }}
            onDragOver={(event) => {
              if (!card) return
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              if (overIndex !== index) setOverIndex(index)
            }}
            onDrop={(event) => {
              event.preventDefault()
              const raw = event.dataTransfer.getData('text/plain')
              const from = Number.parseInt(raw, 10)
              if (Number.isFinite(from)) onReorder(from, index)
              clearDrag()
            }}
            onDragEnd={clearDrag}
          />
        )
      })}
    </div>
  )
}
