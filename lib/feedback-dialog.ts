'use client'

import { useSyncExternalStore } from 'react'
import type { FeedbackCategory } from './feedback-types'
import { hideFeedbackNudge } from './feedback-prompt'

/**
 * Module-level store so any component can open the shared feedback dialog
 * without prop drilling (same pattern as sign-in and free-trial).
 */

export type FeedbackSource =
  | 'fab'
  | 'footer'
  | 'nudge'
  | 'pack_browser'
  | 'faq'
  | 'about'

let open = false
let category: FeedbackCategory = 'idea'
let source: FeedbackSource = 'fab'
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function openFeedback(options?: {
  category?: FeedbackCategory
  source?: FeedbackSource
}): void {
  hideFeedbackNudge()
  open = true
  category = options?.category ?? 'idea'
  source = options?.source ?? 'fab'
  emit()
}

export function closeFeedback(): void {
  if (!open) return
  open = false
  emit()
}

export function useFeedbackDialog(): {
  open: boolean
  category: FeedbackCategory
  source: FeedbackSource
} {
  const isOpen = useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  )
  const currentCategory = useSyncExternalStore(
    subscribe,
    () => category,
    () => 'idea' as FeedbackCategory,
  )
  const currentSource = useSyncExternalStore(
    subscribe,
    () => source,
    () => 'fab' as FeedbackSource,
  )
  return { open: isOpen, category: currentCategory, source: currentSource }
}
