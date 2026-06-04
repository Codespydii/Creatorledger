'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { currencySymbol } from '@/lib/currencies'

interface RevenueChartProps {
  data: { month: string; revenue: number; expenses: number }[]
  currency?: string
}

function formatYTick(cents: number, sym: string): string {
  const dollars = cents / 100
  const abs = Math.abs(dollars)
  if (abs >= 1_000_000) return `${sym}${(dollars / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (abs >= 1_000) return `${sym}${(dollars / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return `${sym}${Math.round(dollars).toLocaleString()}`
}

export function RevenueChart({ data, currency = 'USD' }: RevenueChartProps) {
  const sym = currencySymbol(currency)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data} margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                width={52}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatYTick(v, sym)}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value ?? 0), currency), '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorExpenses)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
