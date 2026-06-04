'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface SettingsSection {
  id: string
  label: string
}

const SECTIONS: SettingsSection[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'account', label: 'Account' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'security', label: 'Security' },
  { id: 'data', label: 'Data' },
  { id: 'danger', label: 'Danger zone' },
]

export function SettingsNav() {
  const [active, setActive] = useState<string>('profile')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        // Pick the topmost intersecting section
        const top = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        )
        setActive(top.target.id)
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const handleClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
    // Push hash without re-triggering scroll
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav aria-label="Settings sections" className="sticky top-20 hidden md:block">
      <ul className="flex flex-col gap-0.5">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={handleClick(s.id)}
              className={cn(
                'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                active === s.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
              aria-current={active === s.id ? 'true' : undefined}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
