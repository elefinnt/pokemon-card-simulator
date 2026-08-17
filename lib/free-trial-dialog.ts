'use client'

import { useSyncExternalStore } from 'react'

/**
 * Module-level store for the guest free-trial conversion modal, so pack
 * screens can open it without prop drilling (same pattern as sign-in-dialog).
 */

export type FreeTrialSource = 'last_pack' | 'open_attempt'

let open = false
let source: FreeTrialSource = 'last_pack'
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

/** Open the conversion modal. No-ops if it is already showing. */
export function openFreeTrial(nextSource: FreeTrialSource): void {
  if (open) return
  open = true
  source = nextSource
  emit()
}

export function closeFreeTrial(): void {
  if (!open) return
  open = false
  emit()
}

export function useFreeTrialDialog(): {
  open: boolean
  source: FreeTrialSource
} {
  const isOpen = useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  )
  const currentSource = useSyncExternalStore(
    subscribe,
    () => source,
    () => 'last_pack' as FreeTrialSource,
  )
  return { open: isOpen, source: currentSource }
}
