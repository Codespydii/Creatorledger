'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useTour, hasCompletedTour } from '@/hooks/use-tour'
import { TourSpotlight, type SpotRect } from './tour-spotlight'
import { TourTooltip } from './tour-tooltip'
import type { TourStep } from './steps'

interface GuidedTourProps {
  steps: TourStep[]
  onComplete?: () => void
  /** Route the tour auto-starts on for first-time users. Default: /dashboard. */
  autoStartOn?: string
}

/** Resolves once the selector exists in the DOM, or null after `timeout`. */
function waitForElement(selector: string, timeout = 6000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLElement>(selector)
    if (existing) return resolve(existing)
    let done = false
    const finish = (el: HTMLElement | null) => {
      if (done) return
      done = true
      obs.disconnect()
      clearTimeout(timer)
      resolve(el)
    }
    const obs = new MutationObserver(() => {
      const el = document.querySelector<HTMLElement>(selector)
      if (el) finish(el)
    })
    obs.observe(document.body, { childList: true, subtree: true })
    const timer = setTimeout(() => finish(document.querySelector<HTMLElement>(selector)), timeout)
  })
}

export function GuidedTour({ steps, onComplete, autoStartOn = '/dashboard' }: GuidedTourProps) {
  const { isTourActive, startTour, completeTour } = useTour()
  const router = useRouter()
  const pathname = usePathname()

  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<SpotRect | null>(null)
  const [celebrating, setCelebrating] = useState(false)
  const autoStarted = useRef(false)

  // Auto-start once for first-time users on the entry route.
  useEffect(() => {
    if (autoStarted.current || pathname !== autoStartOn || hasCompletedTour()) return
    autoStarted.current = true
    const t = setTimeout(startTour, 700)
    return () => clearTimeout(t)
  }, [pathname, autoStartOn, startTour])

  // Reset to the first step each time the tour opens.
  useEffect(() => {
    if (isTourActive) setStep(0)
  }, [isTourActive])

  // Drive the current step: navigate to its route if needed, then wait for the
  // anchor to mount, scroll it into view, and measure it (re-measuring on
  // scroll/resize). Re-runs whenever the step or the settled route changes.
  useEffect(() => {
    if (!isTourActive) return
    const def = steps[step]
    if (!def) return

    // Not on the right page yet → navigate. This effect re-runs once `pathname`
    // updates, falling through to the measure path below.
    if (pathname !== def.route) {
      router.push(def.route)
      return
    }

    let cancelled = false
    let cleanupListeners: (() => void) | undefined
    const timers: number[] = []

    waitForElement(def.target).then((el) => {
      if (cancelled || !el) {
        if (!cancelled && !el) setRect(null) // graceful centered fallback
        return
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      const measure = () => {
        const r = el.getBoundingClientRect()
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      }
      measure()
      timers.push(window.setTimeout(measure, 260), window.setTimeout(measure, 560))
      window.addEventListener('resize', measure)
      window.addEventListener('scroll', measure, true)
      cleanupListeners = () => {
        window.removeEventListener('resize', measure)
        window.removeEventListener('scroll', measure, true)
      }
    })

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      cleanupListeners?.()
    }
  }, [isTourActive, step, pathname, steps, router])

  const finish = useCallback(() => {
    setCelebrating(true)
    setTimeout(() => {
      setCelebrating(false)
      completeTour()
      onComplete?.()
    }, 1600)
  }, [completeTour, onComplete])

  const next = useCallback(() => {
    setStep((s) => {
      if (s >= steps.length - 1) { finish(); return s }
      return s + 1
    })
  }, [steps.length, finish])

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), [])
  const skip = useCallback(() => completeTour(), [completeTour])

  // Keyboard navigation.
  useEffect(() => {
    if (!isTourActive || celebrating) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); back() }
      else if (e.key === 'Escape') { e.preventDefault(); skip() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isTourActive, celebrating, next, back, skip])

  const current = steps[step]

  return (
    <>
      <AnimatePresence>
        {isTourActive && !celebrating && current && (
          <motion.div key="tour-root">
            <TourSpotlight rect={rect} />
            <TourTooltip
              rect={rect}
              index={step}
              total={steps.length}
              title={current.title}
              description={current.description}
              onBack={back}
              onNext={next}
              onSkip={skip}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{celebrating && <Celebration key="celebration" />}</AnimatePresence>
    </>
  )
}

/** Lightweight confetti burst — no extra dependency. */
function Celebration() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 32 }).map((_, i) => ({
        id: i,
        x: (Math.random() * 2 - 1) * 280,
        y: 150 + Math.random() * 320,
        rot: Math.random() * 640 - 320,
        delay: Math.random() * 0.15,
        color: ['#7c3aed', '#a78bfa', '#c4b5fd', '#34d399', '#fbbf24'][i % 5],
        w: 6 + Math.random() * 7,
      })),
    [],
  )
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-[120] overflow-hidden"
    >
      <div className="absolute left-1/2 top-[16vh]">
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rot }}
            transition={{ duration: 1.5, delay: p.delay, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: p.w,
              height: p.w * 0.6,
              backgroundColor: p.color,
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
