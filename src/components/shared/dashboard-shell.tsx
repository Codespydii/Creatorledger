'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from './sidebar'

export const MOBILE_MENU_OPEN_EVENT = 'cl:open-mobile-menu'

export function MobileMenuTrigger() {
  // Marker no-op so we can import the event name from a 'use client' module
  return null
}

export function DashboardShell({ banner, children }: { banner?: React.ReactNode; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const open = () => setMobileOpen(true)
    window.addEventListener(MOBILE_MENU_OPEN_EVENT, open)
    return () => window.removeEventListener(MOBILE_MENU_OPEN_EVENT, open)
  }, [])

  return (
    <div className="flex h-screen flex-col bg-muted overflow-hidden">
      {banner}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
