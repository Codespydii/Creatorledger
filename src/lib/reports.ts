import 'server-only'
import { db } from './db'

export type ReportPeriod = 'month' | 'quarter' | 'year' | 'all' | 'custom'

export interface ReportData {
  currency: string
  rangeLabel: string
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  chartData: { month: string; revenue: number; expenses: number }[]
  breakdownData: { name: string; value: number }[]
  expenseCats: { category: string; cents: number; pct: number }[]
  plRows: { month: string; revenue: number; expenses: number; profit: number; margin: string }[]
  invoice: {
    paid: number; outstanding: number; overdue: number
    paidCount: number; sentCount: number; overdueCount: number; draftCount: number
    totalInvoiced: number
  }
  deals: { stages: { stage: string; label: string; count: number; valueCents: number }[]; totalPipeline: number }
}

const MAX_CHART_MONTHS = 36
const STAGE_ORDER = ['prospect', 'outreach', 'negotiation', 'contracted', 'in_progress', 'completed', 'lost']

export function isReportPeriod(v: unknown): v is ReportPeriod {
  return typeof v === 'string' && ['month', 'quarter', 'year', 'all', 'custom'].includes(v)
}

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function rangeForPeriod(period: ReportPeriod, from?: string, to?: string): { start: Date; end: Date } {
  const now = new Date()
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  if (period === 'custom' && from && to) {
    return { start: new Date(from), end: new Date(to + 'T23:59:59') }
  }
  switch (period) {
    case 'month':   return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOfToday }
    case 'quarter': return { start: new Date(now.getFullYear(), now.getMonth() - 2, 1), end: endOfToday }
    case 'all':     return { start: new Date(2020, 0, 1), end: endOfToday }
    case 'year':
    default:        return { start: new Date(now.getFullYear(), 0, 1), end: endOfToday }
  }
}

/**
 * Everything a report (and its PDF) needs, scoped entirely to the chosen date
 * range — KPIs, the monthly chart/P&L, breakdowns, and the invoice & deal
 * summaries all reflect only [start, end].
 */
export async function computeReport(
  userId: string,
  period: ReportPeriod,
  from?: string,
  to?: string,
): Promise<ReportData> {
  const { start, end } = rangeForPeriod(period, from, to)

  const [user, revenues, expenses, invoices, deals] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { defaultCurrency: true } }),
    db.revenueEntry.findMany({ where: { userId }, select: { date: true, amountCents: true, source: true } }),
    db.expense.findMany({ where: { userId }, select: { date: true, amountCents: true, category: true } }),
    db.invoice.findMany({ where: { userId }, select: { createdAt: true, status: true, totalCents: true } }),
    db.deal.findMany({ where: { userId }, select: { createdAt: true, stage: true, valueCents: true } }),
  ])
  const currency = user?.defaultCurrency ?? 'USD'

  const fRev = revenues.filter((r) => r.date >= start && r.date <= end)
  const fExp = expenses.filter((e) => e.date >= start && e.date <= end)
  const fInv = invoices.filter((i) => i.createdAt >= start && i.createdAt <= end)
  const fDeals = deals.filter((d) => d.createdAt >= start && d.createdAt <= end)

  const totalRevenue = fRev.reduce((s, r) => s + r.amountCents, 0)
  const totalExpenses = fExp.reduce((s, e) => s + e.amountCents, 0)
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  // Calendar-month buckets spanning the range, clamped to the exact edges so the
  // chart/P&L sum back to the KPI totals. Capped to the most recent N months.
  const buckets: { s: Date; e: Date }[] = []
  let y = start.getFullYear()
  let m = start.getMonth()
  const endY = end.getFullYear()
  const endM = end.getMonth()
  while (y < endY || (y === endY && m <= endM)) {
    const ms = new Date(y, m, 1)
    const me = new Date(y, m + 1, 0, 23, 59, 59)
    buckets.push({ s: ms < start ? start : ms, e: me > end ? end : me })
    m++
    if (m > 11) { m = 0; y++ }
  }
  const capped = buckets.length > MAX_CHART_MONTHS ? buckets.slice(-MAX_CHART_MONTHS) : buckets
  const manyMonths = capped.length > 12

  const chartData = capped.map((b) => ({
    month: b.s.toLocaleString('default', { month: 'short', year: manyMonths ? '2-digit' : undefined }),
    revenue: revenues.filter((r) => r.date >= b.s && r.date <= b.e).reduce((s, r) => s + r.amountCents, 0),
    expenses: expenses.filter((x) => x.date >= b.s && x.date <= b.e).reduce((s, x) => s + x.amountCents, 0),
  }))

  const plRows = chartData.map((r) => ({
    month: r.month,
    revenue: r.revenue,
    expenses: r.expenses,
    profit: r.revenue - r.expenses,
    margin: r.revenue > 0 ? (((r.revenue - r.expenses) / r.revenue) * 100).toFixed(1) : '—',
  }))

  const bySource: Record<string, number> = {}
  for (const r of fRev) bySource[r.source] = (bySource[r.source] || 0) + r.amountCents
  const breakdownData = Object.entries(bySource).map(([name, value]) => ({ name: titleCase(name), value }))

  const byCat: Record<string, number> = {}
  for (const e of fExp) byCat[e.category] = (byCat[e.category] || 0) + e.amountCents
  const expenseCats = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .map(([category, cents]) => ({ category, cents, pct: totalExpenses > 0 ? (cents / totalExpenses) * 100 : 0 }))

  const sumInv = (st: string) => fInv.filter((i) => i.status === st).reduce((s, i) => s + i.totalCents, 0)
  const cntInv = (st: string) => fInv.filter((i) => i.status === st).length
  const invoice = {
    paid: sumInv('paid'),
    outstanding: sumInv('sent'),
    overdue: sumInv('overdue'),
    paidCount: cntInv('paid'),
    sentCount: cntInv('sent'),
    overdueCount: cntInv('overdue'),
    draftCount: cntInv('draft'),
    totalInvoiced: fInv.reduce((s, i) => s + i.totalCents, 0),
  }

  const byStage: Record<string, { count: number; valueCents: number }> = {}
  for (const d of fDeals) {
    byStage[d.stage] ??= { count: 0, valueCents: 0 }
    byStage[d.stage].count++
    byStage[d.stage].valueCents += d.valueCents
  }
  const stages = STAGE_ORDER.filter((s) => byStage[s]).map((s) => ({ stage: s, label: titleCase(s), ...byStage[s] }))
  const totalPipeline = fDeals
    .filter((d) => !['completed', 'lost'].includes(d.stage))
    .reduce((s, d) => s + d.valueCents, 0)

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const rangeLabel = `${fmt(start)} – ${fmt(end)}`

  return {
    currency,
    rangeLabel,
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    chartData,
    breakdownData,
    expenseCats,
    plRows,
    invoice,
    deals: { stages, totalPipeline },
  }
}
