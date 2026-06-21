'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { FEATURES, RESOURCES } from './nav-data'

export function SiteHeader() {
  // Which desktop dropdown is open ('product' | 'resources' | null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // Close dropdowns on Escape and on outside click.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenMenu(null)
        setMobileOpen(false)
      }
    }
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [])

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid h-16 grid-cols-[1fr_auto_1fr] items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" aria-label="Caelo home">
          <Image src="/caelo-logo.png" alt="Caelo" width={125} height={36} priority className="h-9 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 text-sm">
          <DropdownTrigger
            id="product"
            label="Product"
            open={openMenu === 'product'}
            onOpen={() => setOpenMenu('product')}
            onClose={() => setOpenMenu(null)}
            onToggle={() => setOpenMenu((m) => (m === 'product' ? null : 'product'))}
          >
            <div className="grid w-[34rem] grid-cols-2 gap-1 p-2">
              {FEATURES.map((f) => (
                <Link
                  key={f.slug}
                  href={`/features/${f.slug}`}
                  onClick={() => setOpenMenu(null)}
                  className="flex items-start gap-3 rounded-lg p-3 hover:bg-accent transition-colors"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-4 w-4 text-primary" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{f.name}</span>
                    <span className="block text-xs text-muted-foreground">{f.tagline}</span>
                  </span>
                </Link>
              ))}
            </div>
          </DropdownTrigger>

          <DropdownTrigger
            id="resources"
            label="Resources"
            open={openMenu === 'resources'}
            onOpen={() => setOpenMenu('resources')}
            onClose={() => setOpenMenu(null)}
            onToggle={() => setOpenMenu((m) => (m === 'resources' ? null : 'resources'))}
          >
            <div className="w-80 p-2">
              {RESOURCES.map((r) =>
                r.href ? (
                  <Link
                    key={r.name}
                    href={r.href}
                    onClick={() => setOpenMenu(null)}
                    className="block rounded-lg p-3 hover:bg-accent transition-colors"
                  >
                    <span className="block text-sm font-medium text-foreground">{r.name}</span>
                    <span className="block text-xs text-muted-foreground">{r.desc}</span>
                  </Link>
                ) : (
                  <div key={r.name} className="rounded-lg p-3 opacity-60">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {r.name}
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Soon
                      </span>
                    </span>
                    <span className="block text-xs text-muted-foreground">{r.desc}</span>
                  </div>
                ),
              )}
            </div>
          </DropdownTrigger>

          <Link
            href="/blog"
            className="rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Blog
          </Link>

          <Link
            href="/#pricing"
            className="rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Pricing
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 justify-self-end">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="hidden sm:inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
          >
            Join Free Beta
          </Link>
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-accent transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4 space-y-5">
            <MobileGroup title="Product">
              {FEATURES.map((f) => (
                <Link
                  key={f.slug}
                  href={`/features/${f.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent transition-colors"
                >
                  <f.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{f.name}</span>
                </Link>
              ))}
            </MobileGroup>

            <MobileGroup title="Resources">
              {RESOURCES.map((r) =>
                r.href ? (
                  <Link
                    key={r.name}
                    href={r.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-2 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    {r.name}
                  </Link>
                ) : (
                  <div key={r.name} className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                    {r.name}
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                      Soon
                    </span>
                  </div>
                ),
              )}
            </MobileGroup>

            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Blog
            </Link>

            <Link
              href="/#pricing"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Pricing
            </Link>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary text-sm font-medium text-white hover:bg-violet-700 transition-colors"
              >
                Join Free Beta
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

function DropdownTrigger({
  id,
  label,
  open,
  onOpen,
  onClose,
  onToggle,
  children,
}: {
  id: string
  label: string
  open: boolean
  onOpen: () => void
  onClose: () => void
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-expanded={open}
        aria-controls={`menu-${id}`}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          id={`menu-${id}`}
          className="absolute left-0 top-full pt-2"
        >
          <div className="rounded-2xl border border-border bg-card shadow-xl">{children}</div>
        </div>
      )}
    </div>
  )
}

function MobileGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}
