'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'caelo_tour_completed'

// Module-level store so a "Take the tour" button anywhere and the <GuidedTour>
// mounted in the layout share one source of truth without a provider wrapper.
let active = false
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}
function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
function getSnapshot() {
  return active
}
function getServerSnapshot() {
  return false
}

export function hasCompletedTour(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Tour state hook. `startTour()` opens the guided tour from anywhere;
 * `completeTour()` marks it done in localStorage so it never auto-shows again.
 */
export function useTour() {
  const isTourActive = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const startTour = useCallback(() => {
    active = true
    emit()
  }, [])

  const endTour = useCallback(() => {
    active = false
    emit()
  }, [])

  const completeTour = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    active = false
    emit()
  }, [])

  return { isTourActive, startTour, endTour, completeTour, hasCompleted: hasCompletedTour }
}
