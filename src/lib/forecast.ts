import type { RevenueEntry, Expense, Invoice, Deal } from '@/generated/prisma/models'
import { formatCurrency } from '@/lib/utils'

const HORIZON_DAYS = 90
const TRAILING_DAYS = 90

const DEAL_PROBABILITY: Record<string, number> = {
  prospect: 0,
  outreach: 0,
  negotiation: 0.5,
  contracted: 0.9,
  in_progress: 0.85,
  completed: 0,
  lost: 0,
}

const INVOICE_PROBABILITY: Record<string, number> = {
  draft: 0,
  sent: 0.95,
  overdue: 0.7,
  paid: 0,
  cancelled: 0,
}

const MIN_DAILY_FOR_RECURRING_CENTS = 100

interface ForecastInflow {
  date: Date
  amountCents: number
  sourceKind: 'invoice' | 'deal' | 'recurring'
  sourceLabel: string
}

interface ForecastOutflow {
  date: Date
  amountCents: number
}

export interface ForecastDay {
  date: string
  inflows: number
  outflows: number
  net: number
  balance: number
}

export interface ForecastSourceTotal {
  kind: 'invoice' | 'deal' | 'recurring'
  label: string
  amountCents: number
}

export interface ForecastResult {
  startDate: string
  endDate: string
  startingBalance: number
  days: ForecastDay[]
  totalInflows: number
  totalOutflows: number
  netChange: number
  projectedBalance30: number
  projectedBalance60: number
  projectedBalance90: number
  lowestPoint: { date: string; balance: number }
  highestPoint: { date: string; balance: number }
  inflowsBySource: ForecastSourceTotal[]
  confirmedInflows: number
  recurringInflows: number
  insights: string[]
  hasData: boolean
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(d: Date, days: number): Date {
  const n = new Date(d)
  n.setDate(n.getDate() + days)
  return n
}

function humanizeSource(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function computeForecast(input: {
  revenues: RevenueEntry[]
  expenses: Expense[]
  invoices: Invoice[]
  deals: Deal[]
  startingBalance?: number
  horizonDays?: number
}): ForecastResult {
  const horizon = input.horizonDays ?? HORIZON_DAYS
  const today = startOfDay(new Date())
  const horizonEnd = addDays(today, horizon)
  const trailingStart = addDays(today, -TRAILING_DAYS)

  const inflows: ForecastInflow[] = []
  const outflows: ForecastOutflow[] = []

  for (const inv of input.invoices) {
    const prob = INVOICE_PROBABILITY[inv.status] ?? 0
    if (prob === 0) continue
    let expected = startOfDay(inv.dueDate)
    if (inv.status === 'overdue' || expected < today) {
      expected = addDays(today, 7)
    }
    if (expected > horizonEnd) continue
    inflows.push({
      date: expected,
      amountCents: Math.round(inv.totalCents * prob),
      sourceKind: 'invoice',
      sourceLabel: `Invoice · ${inv.clientName}`,
    })
  }

  for (const deal of input.deals) {
    const prob = DEAL_PROBABILITY[deal.stage] ?? 0
    if (prob === 0) continue
    let expected: Date
    if (deal.endDate) {
      expected = startOfDay(deal.endDate)
    } else if (deal.startDate) {
      expected = addDays(startOfDay(deal.startDate), 30)
    } else {
      expected = addDays(today, 30)
    }
    if (expected < today) expected = addDays(today, 14)
    if (expected > horizonEnd) continue
    inflows.push({
      date: expected,
      amountCents: Math.round(deal.valueCents * prob),
      sourceKind: 'deal',
      sourceLabel: `Deal · ${deal.brandName}`,
    })
  }

  const trailingRevBySource = new Map<string, number>()
  for (const r of input.revenues) {
    if (r.dealId) continue
    if (r.date < trailingStart || r.date > today) continue
    trailingRevBySource.set(r.source, (trailingRevBySource.get(r.source) ?? 0) + r.amountCents)
  }

  for (const [source, total] of trailingRevBySource) {
    const dailyAvg = total / TRAILING_DAYS
    if (dailyAvg < MIN_DAILY_FOR_RECURRING_CENTS) continue
    let cursor = addDays(today, 7)
    while (cursor <= horizonEnd) {
      inflows.push({
        date: new Date(cursor),
        amountCents: Math.round(dailyAvg * 7),
        sourceKind: 'recurring',
        sourceLabel: `Recurring · ${humanizeSource(source)}`,
      })
      cursor = addDays(cursor, 7)
    }
  }

  const trailingExpTotal = input.expenses
    .filter((e) => e.date >= trailingStart && e.date <= today)
    .reduce((s, e) => s + e.amountCents, 0)
  const dailyExpAvg = trailingExpTotal / TRAILING_DAYS

  if (dailyExpAvg >= MIN_DAILY_FOR_RECURRING_CENTS) {
    let cursor = addDays(today, 7)
    while (cursor <= horizonEnd) {
      outflows.push({ date: new Date(cursor), amountCents: Math.round(dailyExpAvg * 7) })
      cursor = addDays(cursor, 7)
    }
  }

  const inflowByDate = new Map<string, number>()
  for (const f of inflows) {
    const key = isoDate(f.date)
    inflowByDate.set(key, (inflowByDate.get(key) ?? 0) + f.amountCents)
  }
  const outflowByDate = new Map<string, number>()
  for (const o of outflows) {
    const key = isoDate(o.date)
    outflowByDate.set(key, (outflowByDate.get(key) ?? 0) + o.amountCents)
  }

  const startingBalance = input.startingBalance ?? 0
  const days: ForecastDay[] = []
  let running = startingBalance
  for (let i = 0; i <= horizon; i++) {
    const day = addDays(today, i)
    const key = isoDate(day)
    const dIn = inflowByDate.get(key) ?? 0
    const dOut = outflowByDate.get(key) ?? 0
    running += dIn - dOut
    days.push({ date: key, inflows: dIn, outflows: dOut, net: dIn - dOut, balance: running })
  }

  const totalInflows = inflows.reduce((s, f) => s + f.amountCents, 0)
  const totalOutflows = outflows.reduce((s, o) => s + o.amountCents, 0)
  const netChange = totalInflows - totalOutflows

  const at = (i: number) => days[Math.min(i, days.length - 1)].balance
  const projectedBalance30 = at(30)
  const projectedBalance60 = at(60)
  const projectedBalance90 = at(90)

  const lowest = days.reduce((min, d) => (d.balance < min.balance ? d : min), days[0])
  const highest = days.reduce((max, d) => (d.balance > max.balance ? d : max), days[0])

  const grouped = new Map<string, { kind: ForecastSourceTotal['kind']; label: string; amountCents: number }>()
  for (const f of inflows) {
    const key = `${f.sourceKind}|${f.sourceLabel}`
    const existing = grouped.get(key)
    if (existing) {
      existing.amountCents += f.amountCents
    } else {
      grouped.set(key, { kind: f.sourceKind, label: f.sourceLabel, amountCents: f.amountCents })
    }
  }
  const inflowsBySource = Array.from(grouped.values()).sort((a, b) => b.amountCents - a.amountCents)

  const confirmedInflows = inflows
    .filter((f) => f.sourceKind !== 'recurring')
    .reduce((s, f) => s + f.amountCents, 0)
  const recurringInflows = totalInflows - confirmedInflows

  const insights: string[] = []
  const hasData = totalInflows > 0 || totalOutflows > 0

  if (!hasData) {
    insights.push('Add a few invoices, deals, or expenses to generate a meaningful forecast.')
  } else {
    if (startingBalance > 0 && lowest.balance < 0) {
      insights.push(`Cash gap projected on ${lowest.date} — balance dips to ${formatCurrency(lowest.balance)}.`)
    }

    if (netChange >= 0) {
      insights.push(`Projected to gain ${formatCurrency(netChange)} over the next ${horizon} days.`)
    } else {
      insights.push(
        `Projected net negative of ${formatCurrency(Math.abs(netChange))} over the next ${horizon} days — line up more income or trim expenses.`,
      )
    }

    if (confirmedInflows === 0 && recurringInflows > 0) {
      insights.push('All projected income comes from historical averages. Add deals or invoices to firm up the forecast.')
    }

    if (totalInflows > 0 && inflowsBySource[0].amountCents / totalInflows > 0.7) {
      insights.push(`${inflowsBySource[0].label} accounts for over 70% of expected income — diversifying reduces risk.`)
    }

    if (totalOutflows > totalInflows * 0.8 && totalOutflows > 0) {
      insights.push('Expenses are tracking close to income. Watch margin carefully this quarter.')
    }
  }

  return {
    startDate: isoDate(today),
    endDate: isoDate(horizonEnd),
    startingBalance,
    days,
    totalInflows,
    totalOutflows,
    netChange,
    projectedBalance30,
    projectedBalance60,
    projectedBalance90,
    lowestPoint: { date: lowest.date, balance: lowest.balance },
    highestPoint: { date: highest.date, balance: highest.balance },
    inflowsBySource,
    confirmedInflows,
    recurringInflows,
    insights,
    hasData,
  }
}
