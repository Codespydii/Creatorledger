'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import type { SpotRect } from './tour-spotlight'

interface TourTooltipProps {
  rect: SpotRect | null
  index: number
  total: number
  title: string
  description: string
  onBack: () => void
  onNext: () => void
  onSkip: () => void
}

interface Pos {
  top: number
  left: number
  placement: 'top' | 'bottom' | 'center'
  ready: boolean
}

const GAP = 16
const TIP_WIDTH = 340
const SPRING = { type: 'spring', stiffness: 320, damping: 28 } as const

export function TourTooltip({
  rect, index, total, title, description, onBack, onNext, onSkip,
}: TourTooltipProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0, placement: 'bottom', ready: false })

  const isFirst = index === 0
  const isLast = index === total - 1

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const compute = () => {
      const tip = el.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isMobile = vw < 640

      // Mobile, or no target → dock to the bottom-center as a sheet.
      if (isMobile || !rect) {
        const left = Math.max(12, (vw - Math.min(tip.width, vw - 24)) / 2)
        const top = !rect && !isMobile ? (vh - tip.height) / 2 : vh - tip.height - 20
        setPos({ top, left, placement: rect ? 'bottom' : 'center', ready: true })
        return
      }

      // Desktop: prefer below the target, flip above if it would overflow.
      let placement: 'top' | 'bottom' = 'bottom'
      let top = rect.top + rect.height + GAP
      if (top + tip.height > vh - 12) {
        top = rect.top - tip.height - GAP
        placement = 'top'
      }
      top = Math.max(12, Math.min(top, vh - tip.height - 12))

      let left = rect.left + rect.width / 2 - tip.width / 2
      left = Math.max(12, Math.min(left, vw - tip.width - 12))

      setPos({ top, left, placement, ready: true })
    }

    compute()
    window.addEventListener('resize', compute)
    window.addEventListener('scroll', compute, true)
    return () => {
      window.removeEventListener('resize', compute)
      window.removeEventListener('scroll', compute, true)
    }
  }, [rect, index])

  const enterY = pos.placement === 'top' ? 10 : pos.placement === 'center' ? 16 : -10

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Tour step ${index + 1} of ${total}: ${title}`}
      initial={{ opacity: 0, y: enterY, scale: 0.97 }}
      animate={{ opacity: pos.ready ? 1 : 0, y: 0, scale: 1, top: pos.top, left: pos.left }}
      transition={SPRING}
      style={{ position: 'fixed', width: TIP_WIDTH, maxWidth: 'calc(100vw - 24px)' }}
      className={[
        'z-[110] overflow-hidden rounded-2xl p-5',
        // Glass morphism + violet glow
        'border border-white/40 dark:border-white/10',
        'bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl',
        'shadow-[0_0_0_1px_rgba(124,58,237,0.18),0_24px_60px_-15px_rgba(124,58,237,0.45)]',
      ].join(' ')}
    >
      {/* Skip — top right */}
      <button
        type="button"
        onClick={onSkip}
        aria-label="Skip tour"
        className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7c3aed]">
        Step {index + 1} of {total}
      </div>
      <h3 className="pr-6 text-base font-bold leading-snug text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>

      <div className="mt-5 flex items-center justify-between">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <motion.span
              key={i}
              aria-hidden
              animate={{ width: i === index ? 18 : 6, opacity: i === index ? 1 : 0.4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="h-1.5 rounded-full"
              style={{ backgroundColor: i === index ? '#7c3aed' : 'currentColor' }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#7c3aed] px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
          >
            {isLast ? (<>Done <Check className="h-3.5 w-3.5" /></>) : (<>Next <ArrowRight className="h-3.5 w-3.5" /></>)}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
