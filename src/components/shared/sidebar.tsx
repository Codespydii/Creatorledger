'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  DollarSign,
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <DollarSign className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-foreground">Creator Ledger</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border px-3 py-4 space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
