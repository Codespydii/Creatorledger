'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { currencySymbol } from '@/lib/currencies'
import type { ForecastDay } from '@/lib/forecast'

interface ForecastChartProps {
  days: ForecastDay[]
  currency?: string
}

export function ForecastChart({ days, currency = 'USD' }: ForecastChartProps) {
  const sym = currencySymbol(currency)
  const chartData = days.map((d) => ({
    date: d.date,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    balance: d.balance,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projected Cash Position</CardTitle>
        <CardDescription>Running balance over the next 90 days based on confirmed and recurring activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              interval={Math.max(0, Math.floor(chartData.length / 8))}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${sym}${(v / 100).toLocaleString()}`}
            />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value ?? 0), currency), 'Balance']}
              labelFormatter={(label) => `${label}`}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              name="Balance"
              stroke="#7c3aed"
              strokeWidth={2}
              fill="url(#colorBalance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
