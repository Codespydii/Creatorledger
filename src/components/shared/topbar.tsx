import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { SearchModal } from './search-modal'
import { NotificationPanel } from './notification-panel'
import { ThemeToggle } from './theme-toggle'
import { MobileMenuButton } from './mobile-menu-button'
import { AvatarMenu } from './avatar-menu'

interface TopbarProps {
  title: string
  subtitle?: string
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?'
}

export async function Topbar({ title, subtitle }: TopbarProps) {
  const session = await verifySession()
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true },
  })
  const initials = user?.name ? getInitials(user.name) : '?'

  return (
    <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between gap-3 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 sm:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <MobileMenuButton />
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <SearchModal />
        <ThemeToggle />
        <NotificationPanel />
        <AvatarMenu name={user?.name ?? null} email={user?.email ?? ''} initials={initials} />
      </div>
    </header>
  )
}
