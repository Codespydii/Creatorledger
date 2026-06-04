import { FileText, Handshake, Repeat } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { ForecastSourceTotal } from '@/lib/forecast'

interface ForecastSourcesProps {
  sources: ForecastSourceTotal[]
  totalInflows: number
  currency?: string
}

const ICONS = {
  invoice: FileText,
  deal: Handshake,
  recurring: Repeat,
} as const

const ICON_TONE = {
  invoice: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
  deal: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
  recurring: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
} as const

export function ForecastSources({ sources, totalInflows, currency = 'USD' }: ForecastSourcesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expected Inflows</CardTitle>
        <CardDescription>Where your projected income is coming from.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {sources.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No income signals yet. Add deals or invoices to see your forecast.
          </p>
        ) : (
          <div className="space-y-3">
            {sources.slice(0, 8).map((s, i) => {
              const Icon = ICONS[s.kind]
              const tone = ICON_TONE[s.kind]
              const pct = totalInflows > 0 ? (s.amountCents / totalInflows) * 100 : 0
              return (
                <div key={`${s.kind}-${i}`} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone} shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{s.label}</span>
                      <span className="text-sm font-semibold text-foreground shrink-0">
                        {formatCurrency(s.amountCents, currency)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary/60" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
