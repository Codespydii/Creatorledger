import Image from 'next/image'
import Link from 'next/link'
import { FOOTER_COLUMNS } from './nav-data'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Image src="/caelo-logo.png" alt="Caelo" width={97} height={28} className="h-7 w-auto" />
            <p className="mt-3 max-w-xs text-xs text-muted-foreground">
              The financial OS for full-time creators.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                {col.heading}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/70">
                        {link.label}
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                          Soon
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} Caelo. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
