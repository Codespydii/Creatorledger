'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, TrendingDown, Minus, Sparkles, Users, FlaskConical, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency, dollarsToCents } from '@/lib/utils'
import { currencySymbol } from '@/lib/currencies'
import { scoreOffer, type BenchmarkStats, type BenchmarkConfidence } from '@/lib/benchmarks-types'

interface Props {
  stats: BenchmarkStats
  currency?: string
}

const CONFIDENCE: Record<BenchmarkConfidence, {
  label: string
  icon: typeof FlaskConical
  className: string
  note: (s: BenchmarkStats) => string
}> = {
  estimate: {
    label: 'Modeled estimate',
    icon: FlaskConical,
    className: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200',
    note: () =>
      'No creator-reported deals for this exact slice yet, so these figures are modeled from industry CPMs and audience size. Contribute a real rate to start replacing the estimate.',
  },
  emerging: {
    label: 'Emerging data',
    icon: Sparkles,
    className: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300',
    note: (s) =>
      `Blends ${s.userSamples} real creator-reported deal${s.userSamples === 1 ? '' : 's'} with modeled estimates. Treat it as a directional range — accuracy sharpens as more creators contribute.`,
  },
  community: {
    label: 'Community-backed',
    icon: Users,
    className: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300',
    note: (s) =>
      `Backed by ${s.userSamples} anonymized creator-reported deals${s.trimmedOutliers > 0 ? `, with ${s.trimmedOutliers} outlier${s.trimmedOutliers === 1 ? '' : 's'} trimmed` : ''}. Median shown to resist extremes.`,
  },
  verified: {
    label: 'Verified deals',
    icon: ShieldCheck,
    className: 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200',
    note: (s) => {
      const others = s.userSamples + s.seedSamples
      return `Includes ${s.verifiedSamples} verified rate${s.verifiedSamples === 1 ? '' : 's'} sourced from real, completed & paid deals${others > 0 ? `, alongside ${others.toLocaleString()} other data point${others === 1 ? '' : 's'}` : ''}. The strongest signal we have.`
    },
  },
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

  const conf = CONFIDENCE[stats.confidence]
  const ConfIcon = conf.icon

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle>Going rate</CardTitle>
              <CardDescription>
                Based on {stats.count.toLocaleString()} data points
                {stats.userSamples + stats.verifiedSamples > 0
                  ? ` · ${(stats.userSamples + stats.verifiedSamples).toLocaleString()} from creators`
                  : ' · all modeled'}
                {stats.verifiedSamples > 0 ? ` (${stats.verifiedSamples.toLocaleString()} verified)` : ''}
              </CardDescription>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${conf.className}`}>
              <ConfIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {conf.label}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{conf.note(stats)}</p>
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

          <details className="mt-6 group">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground list-none flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              How these numbers work
              <span className="text-muted-foreground/60 group-open:hidden">▸</span>
              <span className="text-muted-foreground/60 hidden group-open:inline">▾</span>
            </summary>
            <div className="mt-2 space-y-1.5 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="font-medium text-foreground">Modeled estimates</strong> are derived from
                published industry CPMs for each niche, scaled by audience size and adjusted per format
                (e.g. a dedicated video earns more than a short). They&apos;re a starting point, not gospel.
              </p>
              <p>
                <strong className="font-medium text-foreground">Creator-reported deals</strong> are
                anonymized rates other creators submitted — no brand names or personal details are stored.
                As more come in, they progressively replace the estimate for a slice.
              </p>
              <p>
                <strong className="font-medium text-foreground">Verified deals</strong> are the strongest
                signal: rates a creator contributed straight from a real, completed &amp; paid deal in their own
                ledger — so the number is backed by money that actually changed hands, not a guess.
              </p>
              <p>
                We show the <strong className="font-medium text-foreground">median</strong> (not the average)
                and trim the most extreme {Math.round(0.05 * 100)}% on each end, so a single outlier or typo
                can&apos;t distort the range.
              </p>
            </div>
          </details>
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
            step={1}
            label="Offer amount"
            leadingSlot={currencySymbol(currency)}
            placeholder="e.g. 3500"
            value={offer}
            onChange={(e) => setOffer(e.currentTarget.value)}
          />
          {offer && offerCents > 0 && (
            <div className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${VStyle}`}>
              <VIcon className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium">{score.message}</div>
                {stats.verifiedSamples > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
                    <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
                    Compared against {stats.verifiedSamples} verified deal{stats.verifiedSamples === 1 ? '' : 's'}.
                  </div>
                )}
              </div>
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
