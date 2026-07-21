'use client'

import { useSyncExternalStore } from 'react'

/**
 * Tiny module-level store so any component can open the shared sign-in dialog
 * without prop drilling or a context provider (mirrors the app's other stores).
 */

let open = false
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

export function openSignIn(): void {
  open = true
  emit()
}

export function closeSignIn(): void {
  open = false
  emit()
}

export function useSignInDialogOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  )
}
