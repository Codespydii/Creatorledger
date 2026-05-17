import { Topbar } from '@/components/shared/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RevenueChart } from '@/components/features/dashboard/revenue-chart'
import { RevenueBreakdown } from '@/components/features/dashboard/revenue-breakdown'
import { PeriodFilter } from '@/components/features/reports/period-filter'
import { ExportButton } from '@/components/features/reports/export-button'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

type Period = 'month' | 'quarter' | 'year' | 'all' | 'custom'

function getPeriodRange(
  period: Period,
  from?: string,
  to?: string,
): { start: Date; end: Date; chartMonths: number } {
  const now = new Date()
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  if (period === 'custom' && from && to) {
    const start = new Date(from)
    const end = new Date(to + 'T23:59:59')
    const diffMonths = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)),
    )
    return { start, end, chartMonths: Math.min(diffMonths, 36) }
  }

  switch (period) {
    case 'month':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOfToday, chartMonths: 3 }
    case 'quarter':
      return { start: new Date(now.getFullYear(), now.getMonth() - 2, 1), end: endOfToday, chartMonths: 6 }
    case 'year':
      return { start: new Date(now.getFullYear(), 0, 1), end: endOfToday, chartMonths: 12 }
    case 'all':
      return { start: new Date(2020, 0, 1), end: endOfToday, chartMonths: 36 }
    default:
      return { start: new Date(now.getFullYear(), 0, 1), end: endOfToday, chartMonths: 12 }
  }
}

interface PageProps {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  draft: 'secondary', sent: 'default', paid: 'success', overdue: 'destructive',
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const { period: rawPeriod, from: rawFrom, to: rawTo } = await searchParams
  const period: Period = ['month', 'quarter', 'year', 'all', 'custom'].includes(rawPeriod ?? '')
    ? (rawPeriod as Period)
    : 'year'

  const session = await verifySession()
  const { start, end, chartMonths } = getPeriodRange(period, rawFrom, rawTo)
  const now = new Date()

  const [user, revenues, expenses, invoices, deals] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { defaultCurrency: true } }),
    db.revenueEntry.findMany({ where: { userId: session.userId }, orderBy: { date: 'desc' } }),
    db.expense.findMany({ where: { userId: session.userId }, orderBy: { date: 'desc' } }),
    db.invoice.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' } }),
    db.deal.findMany({ where: { userId: session.userId } }),
  ])
  const currency = user?.defaultCurrency ?? 'USD'

  // Filter to selected period
  const filteredRevenues = revenues.filter((r) => r.date >= start && r.date <= end)
  const filteredExpenses = expenses.filter((e) => e.date >= start && e.date <= end)

  const totalRevenue = filteredRevenues.reduce((s, r) => s + r.amountCents, 0)
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amountCents, 0)
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  // Chart data — N months ending at `end`
  const chartData = Array.from({ length: chartMonths }, (_, i) => {
    const month = new Date(end.getFullYear(), end.getMonth() - (chartMonths - 1 - i), 1)
    const monthEnd = new Date(end.getFullYear(), end.getMonth() - (chartMonths - 1 - i) + 1, 0)
    const label = month.toLocaleString('default', { month: 'short', year: chartMonths > 12 ? '2-digit' : undefined })
    const rev = revenues.filter((r) => r.date >= month && r.date <= monthEnd).reduce((s, r) => s + r.amountCents, 0)
    const exp = expenses.filter((e) => e.date >= month && e.date <= monthEnd).reduce((s, e) => s + e.amountCents, 0)
    return { month: label, revenue: rev, expenses: exp }
  })

  // Revenue by source (filtered)
  const bySource: Record<string, number> = {}
  for (const r of filteredRevenues) bySource[r.source] = (bySource[r.source] || 0) + r.amountCents
  const breakdownData = Object.entries(bySource).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  }))

  // Expense by category (filtered)
  const byExpenseCat: Record<string, number> = {}
  for (const e of filteredExpenses) byExpenseCat[e.category] = (byExpenseCat[e.category] || 0) + e.amountCents

  // Monthly P&L table (same months as chart)
  const plRows = chartData.map((row) => ({
    month: row.month,
    revenue: row.revenue,
    expenses: row.expenses,
    profit: row.revenue - row.expenses,
    margin: row.revenue > 0 ? ((row.revenue - row.expenses) / row.revenue * 100).toFixed(1) : '—',
  }))

  // Invoice summary
  const invPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.totalCents, 0)
  const invOutstanding = invoices.filter((i) => i.status === 'sent').reduce((s, i) => s + i.totalCents, 0)
  const invOverdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.totalCents, 0)
  const invDraft = invoices.filter((i) => i.status === 'draft').length

  // Deal pipeline by stage
  const dealByStage: Record<string, { count: number; valueCents: number }> = {}
  for (const d of deals) {
    if (!dealByStage[d.stage]) dealByStage[d.stage] = { count: 0, valueCents: 0 }
    dealByStage[d.stage].count++
    dealByStage[d.stage].valueCents += d.valueCents
  }
  const stageOrder = ['prospect', 'outreach', 'negotiation', 'contracted', 'in_progress', 'completed', 'lost']

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Reports" subtitle="Financial insights for your creator business" />
      <main className="flex-1 p-6 space-y-6">

        {/* Period selector + export */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <PeriodFilter current={period} currentFrom={rawFrom} currentTo={rawTo} />
          <ExportButton rows={plRows} period={period} />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue',  value: formatCurrency(totalRevenue, currency),   color: 'text-primary' },
            { label: 'Total Expenses', value: formatCurrency(totalExpenses, currency),   color: 'text-red-500' },
            { label: 'Net Profit',     value: formatCurrency(netProfit, currency),       color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-500' },
            { label: 'Profit Margin',  value: `${profitMargin.toFixed(1)}%`,   color: profitMargin >= 0 ? 'text-emerald-600' : 'text-red-500' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={chartData} currency={currency} />
          </div>
          <RevenueBreakdown data={breakdownData.length ? breakdownData : [{ name: 'No data', value: 1 }]} currency={currency} />
        </div>

        {/* Monthly P&L table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly P&amp;L</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Month</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Revenue</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Expenses</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Net Profit</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Margin</th>
                </tr>
              </thead>
              <tbody>
                {plRows.map((row) => (
                  <tr key={row.month} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="py-2.5 font-medium text-foreground">{row.month}</td>
                    <td className="py-2.5 text-right text-emerald-600 font-medium">{formatCurrency(row.revenue, currency)}</td>
                    <td className="py-2.5 text-right text-red-500">{formatCurrency(row.expenses, currency)}</td>
                    <td className={`py-2.5 text-right font-semibold ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {formatCurrency(row.profit, currency)}
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground">
                      {row.margin === '—' ? '—' : `${row.margin}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td className="pt-2.5 font-semibold text-foreground">Total</td>
                  <td className="pt-2.5 text-right font-semibold text-emerald-600">{formatCurrency(totalRevenue, currency)}</td>
                  <td className="pt-2.5 text-right font-semibold text-red-500">{formatCurrency(totalExpenses, currency)}</td>
                  <td className={`pt-2.5 text-right font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formatCurrency(netProfit, currency)}
                  </td>
                  <td className="pt-2.5 text-right text-muted-foreground">
                    {profitMargin > 0 ? `${profitMargin.toFixed(1)}%` : '—'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Bottom row: expense breakdown + invoice summary + deals */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* Expense breakdown */}
          <Card>
            <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              {Object.entries(byExpenseCat).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No expenses in this period.</p>
              ) : (
                Object.entries(byExpenseCat)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, cents]) => {
                    const pct = totalExpenses > 0 ? (cents / totalExpenses) * 100 : 0
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-foreground capitalize">{cat.replace('_', ' ')}</span>
                          <span className="text-muted-foreground text-xs">{formatCurrency(cents, currency)} · {pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })
              )}
            </CardContent>
          </Card>

          {/* Invoice summary */}
          <Card>
            <CardHeader><CardTitle>Invoice Summary</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[
                { label: 'Paid',        value: invPaid,        badge: 'success' as const,      count: invoices.filter(i => i.status === 'paid').length },
                { label: 'Outstanding', value: invOutstanding, badge: 'default' as const,      count: invoices.filter(i => i.status === 'sent').length },
                { label: 'Overdue',     value: invOverdue,     badge: 'destructive' as const,  count: invoices.filter(i => i.status === 'overdue').length },
                { label: 'Draft',       value: null,           badge: 'secondary' as const,    count: invDraft },
              ].map(({ label, value, badge, count }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={badge}>{label}</Badge>
                    <span className="text-xs text-muted-foreground">{count} invoice{count !== 1 ? 's' : ''}</span>
                  </div>
                  {value !== null && (
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(value, currency)}</span>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Invoiced</span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(invoices.reduce((s, i) => s + i.totalCents, 0), currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Deal pipeline */}
          <Card>
            <CardHeader><CardTitle>Deal Pipeline</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2.5">
              {deals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No deals yet.</p>
              ) : (
                stageOrder.filter((s) => dealByStage[s]).map((s) => {
                  const { count, valueCents } = dealByStage[s]
                  const label = s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                  return (
                    <div key={s} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground">{count}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{formatCurrency(valueCents, currency)}</span>
                    </div>
                  )
                })
              )}
              {deals.length > 0 && (
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Pipeline</span>
                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(deals.filter(d => !['completed','lost'].includes(d.stage)).reduce((s,d) => s + d.valueCents, 0), currency)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}
