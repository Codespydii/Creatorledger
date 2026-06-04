import { FileText } from 'lucide-react'
import { Topbar } from '@/components/shared/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RevenueChart } from '@/components/features/dashboard/revenue-chart'
import { RevenueBreakdown } from '@/components/features/dashboard/revenue-breakdown'
import { PeriodFilter } from '@/components/features/reports/period-filter'
import { ExportButton } from '@/components/features/reports/export-button'
import { verifySession } from '@/lib/session'
import { computeReport, isReportPeriod, type ReportPeriod } from '@/lib/reports'
import { formatCurrency } from '@/lib/utils'

interface PageProps {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const { period: rawPeriod, from: rawFrom, to: rawTo } = await searchParams
  const period: ReportPeriod = isReportPeriod(rawPeriod) ? rawPeriod : 'year'

  const session = await verifySession()
  const r = await computeReport(session.userId, period, rawFrom, rawTo)
  const { currency } = r

  // Link to the chrome-free print view, carrying the same range.
  const qs = new URLSearchParams({ period })
  if (period === 'custom' && rawFrom && rawTo) {
    qs.set('from', rawFrom)
    qs.set('to', rawTo)
  }
  const pdfHref = `/report-pdf?${qs.toString()}`

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Reports" subtitle="Financial insights for your creator business" />
      <main className="flex-1 p-4 sm:p-6 space-y-6">

        {/* Period selector + exports */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <PeriodFilter current={period} currentFrom={rawFrom} currentTo={rawTo} />
          <div className="flex items-center gap-2">
            <ExportButton rows={r.plRows} period={period} />
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Download PDF
            </a>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue',  value: formatCurrency(r.totalRevenue, currency),   color: 'text-primary' },
            { label: 'Total Expenses', value: formatCurrency(r.totalExpenses, currency),   color: 'text-red-500 dark:text-red-400' },
            { label: 'Net Profit',     value: formatCurrency(r.netProfit, currency),       color: r.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400' },
            { label: 'Profit Margin',  value: `${r.profitMargin.toFixed(1)}%`,             color: r.profitMargin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400' },
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
            <RevenueChart data={r.chartData} currency={currency} />
          </div>
          <RevenueBreakdown data={r.breakdownData.length ? r.breakdownData : [{ name: 'No data', value: 1 }]} currency={currency} />
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
                {r.plRows.map((row) => (
                  <tr key={row.month} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="py-2.5 font-medium text-foreground">{row.month}</td>
                    <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(row.revenue, currency)}</td>
                    <td className="py-2.5 text-right text-red-500 dark:text-red-400">{formatCurrency(row.expenses, currency)}</td>
                    <td className={`py-2.5 text-right font-semibold ${row.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
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
                  <td className="pt-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(r.totalRevenue, currency)}</td>
                  <td className="pt-2.5 text-right font-semibold text-red-500 dark:text-red-400">{formatCurrency(r.totalExpenses, currency)}</td>
                  <td className={`pt-2.5 text-right font-bold ${r.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {formatCurrency(r.netProfit, currency)}
                  </td>
                  <td className="pt-2.5 text-right text-muted-foreground">
                    {r.profitMargin > 0 ? `${r.profitMargin.toFixed(1)}%` : '—'}
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
              {r.expenseCats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No expenses in this period.</p>
              ) : (
                r.expenseCats.map(({ category, cents, pct }) => (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-foreground capitalize">{category.replace('_', ' ')}</span>
                      <span className="text-muted-foreground text-xs">{formatCurrency(cents, currency)} · {pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Invoice summary */}
          <Card>
            <CardHeader><CardTitle>Invoice Summary</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[
                { label: 'Paid',        value: r.invoice.paid,        badge: 'success' as const,      count: r.invoice.paidCount },
                { label: 'Outstanding', value: r.invoice.outstanding, badge: 'default' as const,      count: r.invoice.sentCount },
                { label: 'Overdue',     value: r.invoice.overdue,     badge: 'destructive' as const,  count: r.invoice.overdueCount },
                { label: 'Draft',       value: null,                  badge: 'secondary' as const,    count: r.invoice.draftCount },
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
                <span className="text-sm font-bold text-foreground">{formatCurrency(r.invoice.totalInvoiced, currency)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Deal pipeline */}
          <Card>
            <CardHeader><CardTitle>Deal Pipeline</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2.5">
              {r.deals.stages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No deals in this period.</p>
              ) : (
                r.deals.stages.map(({ stage, label, count, valueCents }) => (
                  <div key={stage} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(valueCents, currency)}</span>
                  </div>
                ))
              )}
              {r.deals.stages.length > 0 && (
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Pipeline</span>
                  <span className="text-sm font-bold text-primary">{formatCurrency(r.deals.totalPipeline, currency)}</span>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}
