'use client'

import { useSyncExternalStore } from 'react'

/**
 * Occasional, non-blocking nudge to leave feedback. The floating button is
 * always there; this only pops a small card after a couple of pack opens,
 * then stays quiet for weeks if dismissed.
 */

const STORAGE_KEY = 'packrip.feedbackPrompt.v1'
const DISMISS_MS = 21 * 24 * 60 * 60 * 1000
const MIN_PACKS = 2

type Stored = {
  submittedAt?: number
  dismissedAt?: number
}

let nudgeOpen = false
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

function readStored(): Stored {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Stored
  } catch {
    return {}
  }
}

function writeStored(next: Stored) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / serialisation errors
  }
}

function canNudge(): boolean {
  const stored = readStored()
  if (stored.submittedAt) return false
  if (stored.dismissedAt && Date.now() - stored.dismissedAt < DISMISS_MS) {
    return false
  }
  return true
}

/** Offer the nudge after a pack summary, if the visitor has earned an ask. */
export function maybeShowFeedbackNudge(packsOpened: number): void {
  if (nudgeOpen) return
  if (packsOpened < MIN_PACKS) return
  if (!canNudge()) return
  nudgeOpen = true
  emit()
}

export function hideFeedbackNudge(): void {
  if (!nudgeOpen) return
  nudgeOpen = false
  emit()
}

/** Visitor said not now — stay quiet for a few weeks. */
export function dismissFeedbackNudge(): void {
  writeStored({ ...readStored(), dismissedAt: Date.now() })
  hideFeedbackNudge()
}

/** After a successful send, never auto-prompt this browser again. */
export function recordFeedbackSubmitted(): void {
  writeStored({ ...readStored(), submittedAt: Date.now() })
  hideFeedbackNudge()
}

export function useFeedbackNudgeOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => nudgeOpen,
    () => false,
  )
}
