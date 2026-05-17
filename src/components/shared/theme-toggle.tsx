'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState, useRef } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

const OPTIONS = [
  { value: 'light',  icon: Sun,     label: 'Light' },
  { value: 'dark',   icon: Moon,    label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Avoid hydration mismatch — render a placeholder until mounted
  if (!mounted) return <div className="h-9 w-9 rounded-xl border border-border" />

  const current = OPTIONS.find(o => o.value === theme) ?? OPTIONS[2]
  const Icon = current.icon

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-accent transition-colors"
        title={`Theme: ${current.label}`}
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 flex flex-col w-36 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {OPTIONS.map(({ value, icon: OptionIcon, label }) => (
            <button
              key={value}
              onClick={() => { setTheme(value); setOpen(false) }}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-accent ${
                theme === value ? 'text-primary font-medium' : 'text-foreground'
              }`}
            >
              <OptionIcon className="h-4 w-4 shrink-0" />
              {label}
              {theme === value && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
