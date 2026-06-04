'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Focus management + scroll lock + escape + simple focus trap
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    const prevActive = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    // Focus the cancel (first) button on mount
    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])')
    focusables?.[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        e.stopPropagation()
        onCancel()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevActive?.focus?.()
    }
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-in fade-in duration-100"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel() }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? 'confirm-desc' : undefined}
        className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-xl p-6 animate-in zoom-in-95 fade-in duration-150"
      >
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              destructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="confirm-title" className="text-base font-semibold text-foreground">{title}</h3>
            {description && (
              <div id="confirm-desc" className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {description}
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 flex gap-2 justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
