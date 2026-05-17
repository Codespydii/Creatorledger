import { Calendar, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { ForecastResult } from '@/lib/forecast'

interface ForecastStatsProps {
  forecast: ForecastResult
  currency?: string
}

function formatShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ForecastStats({ forecast, currency = 'USD' }: ForecastStatsProps) {
  const netPositive = forecast.netChange >= 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">In 30 days</span>
              <span className="text-2xl font-bold text-foreground">{formatCurrency(forecast.projectedBalance30, currency)}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">Net change to balance</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">In 90 days</span>
              <span className="text-2xl font-bold text-foreground">{formatCurrency(forecast.projectedBalance90, currency)}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            {netPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={`text-xs font-medium ${netPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {netPositive ? '+' : ''}
              {formatCurrency(forecast.netChange, currency)}
            </span>
            <span className="text-xs text-muted-foreground">net change</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Expected inflows</span>
              <span className="text-2xl font-bold text-emerald-600">{formatCurrency(forecast.totalInflows, currency)}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            {formatCurrency(forecast.confirmedInflows, currency)} confirmed
            {forecast.recurringInflows > 0 ? ` · ${formatCurrency(forecast.recurringInflows, currency)} recurring` : ''}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Expected outflows</span>
              <span className="text-2xl font-bold text-red-500">{formatCurrency(forecast.totalOutflows, currency)}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Low point {formatShort(forecast.lowestPoint.date)} · {formatCurrency(forecast.lowestPoint.balance, currency)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
