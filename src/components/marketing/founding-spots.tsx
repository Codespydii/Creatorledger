'use client'

import { useEffect, useState } from 'react'

interface Stats {
  left: number
  cap: number
  isFull: boolean
}

// Module-level cache so all three <FoundingSpots> instances on the homepage
// share a single request to /api/founding-stats instead of hitting the DB once
// per placement.
let cached: Stats | null = null
let inflight: Promise<Stats | null> | null = null

function loadStats(): Promise<Stats | null> {
  if (cached) return Promise.resolve(cached)
  if (!inflight) {
    inflight = fetch('/api/founding-stats')
      .then((r) => (r.ok ? (r.json() as Promise<Stats>) : null))
      .then((s) => {
        if (s) cached = s
        return s
      })
      .catch(() => null)
  }
  return inflight
}

type Variant = 'badge' | 'pricing' | 'cta'

/**
 * Renders the live "founding spots left" copy. The homepage is fully static;
 * this fills in the real number on the client so it's always current and the
 * page stays cacheable at the edge. While loading (or if the fetch fails) it
 * shows a sensible, number-free placeholder.
 */
export function FoundingSpots({ variant, cap }: { variant: Variant; cap: number }) {
  const [stats, setStats] = useState<Stats | null>(cached)

  useEffect(() => {
    let active = true
    loadStats().then((s) => {
      if (active && s) setStats(s)
    })
    return () => {
      active = false
    }
  }, [])

  if (!stats) {
    // Loading / fallback placeholders (no number).
    if (variant === 'badge') return <>Free beta · Founding spots open</>
    if (variant === 'pricing') return <>Founding price $9/mo — then $19/mo</>
    return null // cta: render nothing until we have a real number
  }

  const { left, isFull } = stats
  const total = cap || stats.cap

  if (variant === 'badge') {
    return <>{isFull ? 'Free beta · Founding spots full' : `Free beta · ${left} of ${total} founding spots left`}</>
  }
  if (variant === 'pricing') {
    return <>{isFull ? 'Founding spots are full — Pro is $19/mo' : `${left} of ${total} founding spots left — then $19/mo`}</>
  }
  return <>{isFull ? 'Founding spots are now full.' : `Only ${left} left.`}</>
}
