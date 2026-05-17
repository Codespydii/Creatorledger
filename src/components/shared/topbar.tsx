import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { SearchModal } from './search-modal'
import { NotificationPanel } from './notification-panel'
import { ThemeToggle } from './theme-toggle'

interface TopbarProps {
  title: string
  subtitle?: string
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export async function Topbar({ title, subtitle }: TopbarProps) {
  const session = await verifySession()
  const user = await db.user.findUnique({ where: { id: session.userId }, select: { name: true } })
  const initials = user?.name ? getInitials(user.name) : '?'

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <SearchModal />
        <ThemeToggle />
        <NotificationPanel />
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center" title={user?.name ?? ''}>
          <span className="text-xs font-semibold text-white">{initials}</span>
        </div>
      </div>
    </header>
  )
}
