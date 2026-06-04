'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useEscapeKey } from '@/hooks/use-escape-key'

interface DetailSheetProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

/**
 * Centered modal for viewing (and acting on) a single record.
 * Closes on Escape, backdrop click, or the ✕ button; locks body scroll while open.
 */
export function DetailSheet({ open, onClose, title, subtitle, children, footer }: DetailSheetProps) {
  useEscapeKey(onClose, open)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && <div className="border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border/60 py-2.5 last:border-0">
      <dt className="mb-0.5 text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  )
}
