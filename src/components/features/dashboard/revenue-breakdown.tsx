'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

// 11 visually distinct hues — one per supported revenue source so nothing repeats.
const COLORS = [
  '#7c3aed', // violet
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
  '#84cc16', // lime
  '#14b8a6', // teal
  '#a855f7', // fuchsia
]

interface RevenueBreakdownProps {
  data: { name: string; value: number }[]
  currency?: string
}

const RADIAN = Math.PI / 180

interface SliceLabelProps {
  cx?: number
  cy?: number
  midAngle?: number
  outerRadius?: number
  percent?: number
}

function renderSliceLabel({ cx = 0, cy = 0, midAngle = 0, outerRadius = 0, percent = 0 }: SliceLabelProps) {
  // Hide tiny slivers — labels there would just stack on top of each other.
  if (percent < 0.05) return null
  const r = outerRadius + 14
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fill: 'var(--foreground)', fontSize: 11, fontWeight: 500 }}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  )
}

export function RevenueBreakdown({ data, currency = 'USD' }: RevenueBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                label={renderSliceLabel}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value ?? 0), currency), '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
          {data.map((entry, i) => (
            <li key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                aria-hidden
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="leading-none whitespace-nowrap">{entry.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
