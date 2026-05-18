'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency, dollarsToCents } from '@/lib/utils'
import { currencySymbol } from '@/lib/currencies'
import { scoreOffer, type BenchmarkStats } from '@/lib/benchmarks-types'

interface Props {
  stats: BenchmarkStats
  currency?: string
}

const VERDICT_STYLE = {
  below: { bg: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300', icon: TrendingDown },
  within: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300', icon: Minus },
  above: { bg: 'bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-950/30 dark:border-violet-900 dark:text-violet-300', icon: TrendingUp },
  unknown: { bg: 'bg-muted/40 border-border text-muted-foreground', icon: Calculator },
} as const

export function BenchmarkStatsDisplay({ stats, currency = 'USD' }: Props) {
  const [offer, setOffer] = useState('')

  if (stats.count === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <p className="text-sm text-muted-foreground">No data points match these filters yet.</p>
          <p className="mt-2 text-xs text-muted-foreground">Be the first to contribute — your rate will be aggregated anonymously.</p>
        </CardContent>
      </Card>
    )
  }

  const offerCents = dollarsToCents(offer)
  const score = scoreOffer(offerCents, stats)
  const VStyle = VERDICT_STYLE[score.verdict].bg
  const VIcon = VERDICT_STYLE[score.verdict].icon

  const range = Math.max(1, stats.max - stats.min)
  const pct = (v: number) => `${((v - stats.min) / range) * 100}%`

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Going rate</CardTitle>
          <CardDescription>
            Based on {stats.count.toLocaleString()} data points
            {stats.userSamples > 0 ? ` · ${stats.userSamples} from creators` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Low (25th)" value={stats.p25} tone="text-muted-foreground" currency={currency} />
            <Stat label="Median" value={stats.median} tone="text-foreground" highlight currency={currency} />
            <Stat label="High (75th)" value={stats.p75} tone="text-muted-foreground" currency={currency} />
            <Stat label="Mean" value={stats.mean} tone="text-muted-foreground" currency={currency} />
          </div>

          <div className="mt-8 mb-3">
            <div className="relative h-2 rounded-full bg-muted">
              <div
                className="absolute h-2 rounded-full bg-primary/30"
                style={{ left: pct(stats.p25), width: `calc(${pct(stats.p75)} - ${pct(stats.p25)})` }}
              />
              <div
                className="absolute -top-0.5 h-3 w-0.5 bg-primary"
                style={{ left: pct(stats.median) }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(stats.min, currency)}</span>
              <span>{formatCurrency(stats.max, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-4 w-4" /> Score an offer
          </CardTitle>
          <CardDescription>Paste an offer amount to see how it compares.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="offerAmount"
            type="number"
            min={0}
            step={50}
            label="Offer amount"
            leadingSlot={currencySymbol(currency)}
            placeholder="e.g. 3500"
            value={offer}
            onChange={(e) => setOffer(e.currentTarget.value)}
          />
          {offer && offerCents > 0 && (
            <div className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${VStyle}`}>
              <VIcon className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="text-sm font-medium">{score.message}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value, tone, highlight, currency = 'USD' }: { label: string; value: number; tone: string; highlight?: boolean; currency?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 ${highlight ? 'text-3xl font-bold' : 'text-xl font-semibold'} ${tone}`}>
        {formatCurrency(value, currency)}
      </div>
    </div>
  )
}
