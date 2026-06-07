'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LogOut, Settings, User, Sparkles, Shield } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { useTour } from '@/hooks/use-tour'
import { isAdmin } from '@/lib/admin'
import { cn } from '@/lib/utils'

interface AvatarMenuProps {
  name: string | null
  email: string
  initials: string
}

export function AvatarMenu({ name, email, initials }: AvatarMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { startTour } = useTour()

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
        aria-label="Account menu"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white transition-shadow',
          'hover:ring-2 hover:ring-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40',
          open && 'ring-2 ring-primary/40',
        )}
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-border bg-card shadow-lg py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="truncate text-sm font-medium text-foreground">{name ?? 'Account'}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              Profile
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); startTour() }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              Take a tour
            </button>
            {isAdmin(email) && (
              <Link
                href="/spiral"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
              >
                <Shield className="h-4 w-4 text-muted-foreground" />
                Admin
              </Link>
            )}
          </div>
          <div className="border-t border-border py-1">
            <form action={logout}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
