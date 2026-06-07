'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useTour, hasCompletedTour } from '@/hooks/use-tour'

/**
 * "Take the tour" chip for the dashboard header. Shows only until the user has
 * completed (or skipped) the tour — it is NOT a permanent fixture. The always-
 * available re-run lives in the profile menu.
 */
export function TourLauncher({ className }: { className?: string }) {
  const { startTour, isTourActive } = useTour()
  const [show, setShow] = useState(false)

  // localStorage is client-only — decide visibility after mount to avoid a
  // hydration mismatch. Re-checks whenever the tour closes.
  useEffect(() => {
    setShow(!hasCompletedTour())
  }, [isTourActive])

  if (!show) return null
  return (
    <button
      type="button"
      onClick={startTour}
      className={[
        'inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:border-[#7c3aed]/40 hover:text-[#7c3aed]',
        className ?? '',
      ].join(' ')}
    >
      <Sparkles className="h-4 w-4" />
      Take the tour
    </button>
  )
}
