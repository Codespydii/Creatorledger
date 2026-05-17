'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, FileText, Handshake, Receipt, TrendingUp, Loader2 } from 'lucide-react'
import { globalSearch, type SearchResult } from '@/app/actions/search'

const typeConfig = {
  invoice: { label: 'Invoice', icon: FileText, color: 'text-blue-500' },
  deal: { label: 'Deal', icon: Handshake, color: 'text-violet-500' },
  expense: { label: 'Expense', icon: Receipt, color: 'text-red-500' },
  revenue: { label: 'Revenue', icon: TrendingUp, color: 'text-emerald-500' },
}

export function SearchModal() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
      setSelected(0)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!query) { setResults([]); return }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await globalSearch(query)
        setResults(res)
        setSelected(0)
      })
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const navigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  // Arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && results[selected]) {
      navigate(results[selected].href)
    }
  }

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    acc[r.type] = [...(acc[r.type] ?? []), r]
    return acc
  }, {})

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-accent transition-colors"
        title="Search (⌘K)"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              {isPending
                ? <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" />
                : <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              }
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search invoices, deals, expenses, revenue…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground font-mono">
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query.length >= 2 && !isPending && results.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
              )}

              {!query && (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Type to search across all your data
                </p>
              )}

              {Object.entries(grouped).map(([type, items]) => {
                const cfg = typeConfig[type as keyof typeof typeConfig]
                const Icon = cfg.icon
                return (
                  <div key={type} className="py-2">
                    <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {cfg.label}s
                    </p>
                    {items.map((item) => {
                      const globalIdx = results.indexOf(item)
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigate(item.href)}
                          onMouseEnter={() => setSelected(globalIdx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            selected === globalIdx ? 'bg-accent' : 'hover:bg-accent'
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                          </div>
                          <span className="text-xs font-semibold text-foreground shrink-0">{item.meta}</span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* Footer hint */}
            {results.length > 0 && (
              <div className="flex items-center gap-4 border-t border-border px-4 py-2">
                <span className="text-xs text-muted-foreground">↑↓ navigate</span>
                <span className="text-xs text-muted-foreground">↵ open</span>
                <span className="text-xs text-muted-foreground">Esc close</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
