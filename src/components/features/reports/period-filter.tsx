'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { CalendarDays } from 'lucide-react'

const PERIODS = [
  { value: 'month',   label: 'This Month' },
  { value: 'quarter', label: 'Last 3 Months' },
  { value: 'year',    label: 'This Year' },
  { value: 'all',     label: 'All Time' },
]

interface Props {
  current: string
  currentFrom?: string
  currentTo?: string
}

export function PeriodFilter({ current, currentFrom, currentTo }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const today = new Date().toISOString().split('T')[0]
  const [showCustom, setShowCustom] = useState(current === 'custom')
  const [from, setFrom] = useState(currentFrom ?? today)
  const [to, setTo] = useState(currentTo ?? today)

  const set = (period: string) => {
    if (period === 'custom') {
      setShowCustom(true)
      return
    }
    setShowCustom(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    params.delete('from')
    params.delete('to')
    router.push(`${pathname}?${params}`)
  }

  const applyCustom = () => {
    if (!from || !to) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', 'custom')
    params.set('from', from)
    params.set('to', to)
    router.push(`${pathname}?${params}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1 rounded-xl border border-border bg-muted/50 p-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => set(p.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              current === p.value && !showCustom
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => set('custom')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            current === 'custom' || showCustom
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Custom
        </button>
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <input
            type="date"
            value={to}
            min={from}
            max={today}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={applyCustom}
            disabled={!from || !to || from > to}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
