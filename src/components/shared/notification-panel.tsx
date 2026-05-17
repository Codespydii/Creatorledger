'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { getNotifications, type Notification, type NotifSeverity } from '@/app/actions/notifications'

const severityConfig: Record<NotifSeverity, { icon: typeof AlertCircle; color: string; bg: string }> = {
  error:   { icon: AlertCircle,   color: 'text-red-600',     bg: 'bg-red-50' },
  warning: { icon: AlertTriangle, color: 'text-amber-600',   bg: 'bg-amber-50' },
  success: { icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
  info:    { icon: Info,          color: 'text-blue-600',    bg: 'bg-blue-50' },
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loaded, setLoaded] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load on first open
  useEffect(() => {
    if (open && !loaded) {
      getNotifications().then((n) => { setNotifications(n); setLoaded(true) })
    }
  }, [open, loaded])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const visible = notifications.filter((n) => !dismissed.has(n.id))
  const hasUrgent = visible.some((n) => n.severity === 'error' || n.severity === 'warning')

  const dismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDismissed((prev) => new Set([...prev, id]))
  }

  const navigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-accent transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {loaded && visible.length > 0 && (
          <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ${hasUrgent ? 'bg-red-500' : 'bg-emerald-500'}`}>
            {visible.length > 9 ? '9+' : visible.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-96 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {visible.length > 0 && (
              <button
                onClick={() => setDismissed(new Set(notifications.map((n) => n.id)))}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Dismiss all
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {!loaded && (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
            )}

            {loaded && visible.length === 0 && (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-0.5">No pending alerts right now.</p>
              </div>
            )}

            {visible.map((notif) => {
              const cfg = severityConfig[notif.severity]
              const Icon = cfg.icon
              return (
                <button
                  key={notif.id}
                  onClick={() => navigate(notif.href)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left border-b border-border last:border-0 hover:bg-accent transition-colors"
                >
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.body}</p>
                  </div>
                  <button
                    onClick={(e) => dismiss(notif.id, e)}
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                    title="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
