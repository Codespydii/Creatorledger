'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, FileText, Handshake, Plus, Receipt, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTIONS = [
  { href: '/revenue?new=1',  label: 'Revenue entry', description: 'Log a payment you received', icon: TrendingUp },
  { href: '/expenses?new=1', label: 'Expense',       description: 'Log a business cost',         icon: Receipt },
  { href: '/invoices?new=1', label: 'Invoice',       description: 'Send a client a bill',         icon: FileText },
  { href: '/deals?new=1',    label: 'Brand deal',    description: 'Track a sponsorship',          icon: Handshake },
]

export function QuickAddMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all',
          'hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          open && 'ring-2 ring-ring ring-offset-2',
        )}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        New
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-border bg-card shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        >
          {ACTIONS.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 px-3 py-2.5 hover:bg-accent transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
