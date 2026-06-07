'use client'

import { motion } from 'framer-motion'

export interface SpotRect {
  top: number
  left: number
  width: number
  height: number
}

interface TourSpotlightProps {
  rect: SpotRect | null
  /** Extra breathing room around the target, in px. */
  padding?: number
}

const SPRING = { type: 'spring', stiffness: 280, damping: 30 } as const
const RADIUS = 16

/**
 * Full-screen dimmer with a rounded cutout around the target. The dimming is
 * produced by a massive box-shadow spread on the cutout element, so the hole
 * stays perfectly crisp. A violet ring pulses around it.
 */
export function TourSpotlight({ rect, padding = 8 }: TourSpotlightProps) {
  // No target → dim the whole screen (centered-tooltip fallback).
  if (!rect) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-[2px]"
      />
    )
  }

  const box = {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100]"
      // Catch every click so the page underneath can't be interacted with mid-tour.
      onClick={(e) => e.stopPropagation()}
    >
      {/* Cutout: the giant spread shadow dims everything outside this rounded box. */}
      <motion.div
        className="absolute"
        initial={false}
        animate={{ top: box.top, left: box.left, width: box.width, height: box.height }}
        transition={SPRING}
        style={{
          borderRadius: RADIUS,
          boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.72)',
        }}
      />
      {/* Pulsing violet ring hugging the cutout. */}
      <motion.div
        className="pointer-events-none absolute"
        initial={false}
        animate={{ top: box.top, left: box.left, width: box.width, height: box.height }}
        transition={SPRING}
        style={{ borderRadius: RADIUS }}
      >
        <motion.div
          className="h-full w-full"
          style={{ borderRadius: RADIUS, border: '2px solid #7c3aed' }}
          animate={{ opacity: [0.7, 0, 0.7], scale: [1, 1.035, 1] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  )
}
