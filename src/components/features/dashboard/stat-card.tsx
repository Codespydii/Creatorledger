import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatCurrency, formatPct } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  valueCents: number
  changePct: number
  icon: LucideIcon
  positive?: boolean
  currency?: string
}

export function StatCard({ title, valueCents, changePct, icon: Icon, positive = true, currency = 'USD' }: StatCardProps) {
  const isPositive = positive ? changePct >= 0 : changePct <= 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold text-foreground">{formatCurrency(valueCents, currency)}</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          )}
          <span className={cn('text-xs font-medium', isPositive ? 'text-emerald-600' : 'text-red-500')}>
            {formatPct(changePct)}
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}
