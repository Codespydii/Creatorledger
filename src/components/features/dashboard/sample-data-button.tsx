'use client'

import { useState, useTransition } from 'react'
import { Sparkles, Loader2, Trash2 } from 'lucide-react'
import { loadSampleData, clearSampleData } from '@/app/actions/sample-data'

interface Props {
  hasSample: boolean
  variant?: 'inline' | 'button'
}

export function SampleDataButton({ hasSample, variant = 'inline' }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleLoad = () => {
    setError(null)
    startTransition(async () => {
      const r = await loadSampleData()
      if (r && !r.success) setError(r.error ?? 'Failed to load sample data')
    })
  }

  const handleClear = () => {
    setError(null)
    if (!confirm('Delete all sample data? This will remove every row tagged as sample. Your real entries are untouched.')) return
    startTransition(async () => {
      const r = await clearSampleData()
      if (r && !r.success) setError(r.error ?? 'Failed to clear sample data')
    })
  }

  if (variant === 'button') {
    return (
      <div className="flex flex-col gap-2">
        {hasSample ? (
          <button
            onClick={handleClear}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-destructive/40 bg-background px-4 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50 w-fit"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {pending ? 'Clearing…' : 'Clear sample data'}
          </button>
        ) : (
          <button
            onClick={handleLoad}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 w-fit"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {pending ? 'Loading…' : 'Load sample data'}
          </button>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }

  // Inline variant — used inside the SetupCard
  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        onClick={handleLoad}
        disabled={pending || hasSample}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 underline-offset-2 hover:underline"
      >
        {pending
          ? <><Loader2 className="h-3 w-3 animate-spin" /> Loading sample data…</>
          : hasSample
            ? <><Sparkles className="h-3 w-3" /> Sample data already loaded</>
            : <><Sparkles className="h-3 w-3" /> Or load sample data to explore first</>}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
