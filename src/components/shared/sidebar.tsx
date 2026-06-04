
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useSyncExternalStore } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Receipt,
  Handshake,
  BarChart2,
  LineChart,
  Sparkles,
  ShieldCheck,
  Scale,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/revenue', label: 'Revenue', icon: TrendingUp },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/deals', label: 'Brand Deals', icon: Handshake },
  { href: '/contracts', label: 'Contracts', icon: ShieldCheck },
  { href: '/forecast', label: 'Forecast', icon: LineChart },
  { href: '/benchmarks', label: 'Benchmarks', icon: Scale },
  { href: '/media-kit', label: 'Media Kit', icon: Sparkles },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
]

const STORAGE_KEY = 'cl:sidebar:collapsed'
const SIDEBAR_CHANGE_EVENT = 'cl:sidebar:change'

function subscribeSidebarCollapsed(cb: () => void) {
  const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) cb() }
  window.addEventListener('storage', onStorage)
  window.addEventListener(SIDEBAR_CHANGE_EVENT, cb)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, cb)
  }
}

function readCollapsed(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const collapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    readCollapsed,
    () => false,
  )

  const setCollapsed = useCallback((value: boolean | ((v: boolean) => boolean)) => {
    const next = typeof value === 'function' ? value(readCollapsed()) : value
    try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0') } catch {}
    window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT))
  }, [])

  // Lock body scroll while mobile drawer open
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [mobileOpen])

  // Close drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onMobileClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, onMobileClose])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'flex h-full flex-col border-r border-border bg-card transition-[width,transform] duration-200 ease-out',
          // Desktop width
          collapsed ? 'md:w-16' : 'md:w-64',
          // Mobile: fixed off-canvas drawer
          'fixed inset-y-0 left-0 z-50 w-64 md:static md:translate-x-0',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0',
        )}
        aria-label="Primary navigation"
      >
       <div className={cn(
  'relative flex items-center justify-center border-b border-border py-3', // h-[74px] हटाया और py-5 जोड़ा
  collapsed ? 'md:px-2 px-6' : 'px-6',
)}>
         <Image
  src="/caelo-icon.png"
  alt="Caelo"
  width={48}// 
  height={48}//
  priority
  className={cn('h-12 w-12 shrink-0 hidden', collapsed && 'md:block')}
/>
<Image
  src="/caelo-logo.png"
  alt="Caelo"
  width={150} // 
  height={50} // 
  priority
  className={cn('h-10 w-auto', collapsed && 'md:hidden')} // h-8 से h-10 किया
/>
          {/* Mobile close button — absolute so it doesn't shift the centered logo */}
          <button
            type="button"
            onClick={onMobileClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className={cn('flex-1 min-h-0 overflow-y-auto space-y-1 py-6', collapsed ? 'md:px-2 px-3' : 'px-3')}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onMobileClose}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  collapsed && 'md:justify-center md:px-0',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={cn(collapsed && 'md:hidden')}>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className={cn('border-t border-border space-y-1 py-4', collapsed ? 'md:px-2 px-3' : 'px-3')}>
          <Link
            href="/settings"
            onClick={onMobileClose}
            title={collapsed ? 'Settings' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
              collapsed && 'md:justify-center md:px-0',
              isActive('/settings')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span className={cn(collapsed && 'md:hidden')}>Settings</span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              title={collapsed ? 'Sign out' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
                collapsed && 'md:justify-center md:px-0',
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={cn(collapsed && 'md:hidden')}>Sign out</span>
            </button>
          </form>
          {/* Desktop-only collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'hidden md:flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
              collapsed && 'justify-center px-0',
            )}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4 shrink-0" /> : <ChevronsLeft className="h-4 w-4 shrink-0" />}
            <span className={cn(collapsed && 'md:hidden')}>Collapse</span>
          </button>
        </div>
      </aside>
    </>
  )
}
