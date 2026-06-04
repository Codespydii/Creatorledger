import type { CSSProperties } from 'react'
import { RevenueChart } from '@/components/features/dashboard/revenue-chart'
import { RevenueBreakdown } from '@/components/features/dashboard/revenue-breakdown'
import { ReportPrintButton } from './report-print-button'
import { formatCurrency } from '@/lib/utils'
import type { ReportData } from '@/lib/reports'

// Force a light palette via CSS vars so the PDF is always clean, even if the
// user's app theme is dark. Recharts + the themed <Card>s read these vars.
const LIGHT_VARS = {
  '--background': '#ffffff',
  '--foreground': '#0f172a',
  '--card': '#ffffff',
  '--card-foreground': '#0f172a',
  '--popover': '#ffffff',
  '--popover-foreground': '#0f172a',
  '--muted': '#f8fafc',
  '--muted-foreground': '#64748b',
  '--border': '#e2e8f0',
  '--input': '#e2e8f0',
  '--secondary': '#f1f5f9',
  '--secondary-foreground': '#0f172a',
  '--primary': '#7c3aed',
  '--primary-foreground': '#ffffff',
  '--accent': '#f1f5f9',
  '--accent-foreground': '#0f172a',
  '--ring': '#7c3aed',
} as CSSProperties

const STATUS_PILL: Record<string, string> = {
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Outstanding: 'bg-blue-50 text-blue-700 border-blue-200',
  Overdue: 'bg-red-50 text-red-700 border-red-200',
  Draft: 'bg-slate-100 text-slate-600 border-slate-200',
}

export function ReportDocument({ data: r }: { data: ReportData }) {
  const c = r.currency
  const generated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0" style={LIGHT_VARS}>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff !important; }
          .no-print { display: none !important; }
          .rpt-doc { box-shadow: none !important; border: none !important; width: auto !important; margin: 0 !important; }
          .rpt-card { break-inside: avoid; }
        }
      `}</style>

      <ReportPrintButton />

      <article className="rpt-doc mx-auto w-[720px] max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financial Report</h1>
            <p className="mt-1 text-sm text-slate-500">{r.rangeLabel}</p>
            <p className="mt-0.5 text-xs text-slate-400">Generated {generated}</p>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/caelo-icon.png" alt="" className="h-6 w-6" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/caelo-logo.png" alt="Caelo" className="h-5 w-auto" />
          </div>
        </header>

        <div className="space-y-6 px-8 py-7">
          {/* KPIs */}
          <section className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Revenue', value: formatCurrency(r.totalRevenue, c), color: 'text-violet-600' },
              { label: 'Total Expenses', value: formatCurrency(r.totalExpenses, c), color: 'text-red-500' },
              { label: 'Net Profit', value: formatCurrency(r.netProfit, c), color: r.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500' },
              { label: 'Profit Margin', value: `${r.profitMargin.toFixed(1)}%`, color: r.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-500' },
            ].map((k) => (
              <div key={k.label} className="rpt-card rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[11px] text-slate-500">{k.label}</p>
                <p className={`mt-1 text-lg font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </section>

          {/* Revenue vs Expenses chart */}
          <section className="rpt-card">
            <RevenueChart data={r.chartData} currency={c} />
          </section>

          {/* Breakdown + expense categories */}
          <section className="grid grid-cols-2 gap-4">
            <div className="rpt-card">
              <RevenueBreakdown
                data={r.breakdownData.length ? r.breakdownData : [{ name: 'No data', value: 1 }]}
                currency={c}
              />
            </div>
            <div className="rpt-card rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">Expenses by Category</h2>
              <div className="mt-3 space-y-3">
                {r.expenseCats.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">No expenses in this period.</p>
                ) : (
                  r.expenseCats.map(({ category, cents, pct }) => (
                    <div key={category}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium capitalize text-slate-700">{category.replace('_', ' ')}</span>
                        <span className="text-xs text-slate-500">{formatCurrency(cents, c)} · {pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Monthly P&L */}
          <section className="rpt-card rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Monthly P&amp;L</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="pb-2 font-medium">Month</th>
                  <th className="pb-2 text-right font-medium">Revenue</th>
                  <th className="pb-2 text-right font-medium">Expenses</th>
                  <th className="pb-2 text-right font-medium">Net Profit</th>
                  <th className="pb-2 text-right font-medium">Margin</th>
                </tr>
              </thead>
              <tbody>
                {r.plRows.map((row) => (
                  <tr key={row.month} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 font-medium text-slate-700">{row.month}</td>
                    <td className="py-2 text-right font-medium text-emerald-600">{formatCurrency(row.revenue, c)}</td>
                    <td className="py-2 text-right text-red-500">{formatCurrency(row.expenses, c)}</td>
                    <td className={`py-2 text-right font-semibold ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatCurrency(row.profit, c)}</td>
                    <td className="py-2 text-right text-slate-500">{row.margin === '—' ? '—' : `${row.margin}%`}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200">
                  <td className="pt-2 font-semibold text-slate-900">Total</td>
                  <td className="pt-2 text-right font-semibold text-emerald-600">{formatCurrency(r.totalRevenue, c)}</td>
                  <td className="pt-2 text-right font-semibold text-red-500">{formatCurrency(r.totalExpenses, c)}</td>
                  <td className={`pt-2 text-right font-bold ${r.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatCurrency(r.netProfit, c)}</td>
                  <td className="pt-2 text-right text-slate-500">{r.profitMargin > 0 ? `${r.profitMargin.toFixed(1)}%` : '—'}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Invoices + deals */}
          <section className="grid grid-cols-2 gap-4">
            <div className="rpt-card rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">Invoice Summary</h2>
              <div className="mt-3 space-y-2.5">
                {[
                  { label: 'Paid', value: r.invoice.paid, count: r.invoice.paidCount },
                  { label: 'Outstanding', value: r.invoice.outstanding, count: r.invoice.sentCount },
                  { label: 'Overdue', value: r.invoice.overdue, count: r.invoice.overdueCount },
                  { label: 'Draft', value: null, count: r.invoice.draftCount },
                ].map(({ label, value, count }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_PILL[label]}`}>{label}</span>
                      <span className="text-xs text-slate-500">{count} invoice{count !== 1 ? 's' : ''}</span>
                    </div>
                    {value !== null && <span className="text-sm font-semibold text-slate-800">{formatCurrency(value, c)}</span>}
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                  <span className="text-sm font-medium text-slate-700">Total Invoiced</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(r.invoice.totalInvoiced, c)}</span>
                </div>
              </div>
            </div>

            <div className="rpt-card rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">Deal Pipeline</h2>
              <div className="mt-3 space-y-2.5">
                {r.deals.stages.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">No deals in this period.</p>
                ) : (
                  r.deals.stages.map(({ stage, label, count, valueCents }) => (
                    <div key={stage} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <span className="text-xs text-slate-500">{count}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{formatCurrency(valueCents, c)}</span>
                    </div>
                  ))
                )}
                {r.deals.stages.length > 0 && (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                    <span className="text-sm font-medium text-slate-700">Total Pipeline</span>
                    <span className="text-sm font-bold text-violet-600">{formatCurrency(r.deals.totalPipeline, c)}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-slate-200 px-8 py-4">
          <span className="text-xs text-slate-400">Generated {generated}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Powered by</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/caelo-icon.png" alt="" className="h-4 w-4" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/caelo-logo.png" alt="Caelo" className="h-3.5 w-auto" />
          </div>
        </footer>
      </article>
    </div>
  )
}
