'use client'

import { Menu } from 'lucide-react'
import { MOBILE_MENU_OPEN_EVENT } from './dashboard-shell'

export function MobileMenuButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(MOBILE_MENU_OPEN_EVENT))}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
      aria-label="Open navigation"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
