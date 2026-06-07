import Link from 'next/link'
import { redirect } from 'next/navigation'
import { TrendingUp, Receipt, DollarSign, FileText, ArrowRight, Clock } from 'lucide-react'
import { Topbar } from '@/components/shared/topbar'
import { StatCard } from '@/components/features/dashboard/stat-card'
import { RevenueChart } from '@/components/features/dashboard/revenue-chart'
import { RevenueBreakdown } from '@/components/features/dashboard/revenue-breakdown'
import { SetupCard } from '@/components/features/dashboard/setup-card'
import { QuickAddMenu } from '@/components/features/dashboard/quick-add-menu'
import { TourLauncher } from '@/components/tour'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import { isYoutubeConfigured } from '@/lib/youtube'

function greeting(hour: number, name: string) {
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const first = name.split(' ')[0]
  return `Good ${time}, ${first}`
}

const invoiceStatusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  draft: 'secondary', sent: 'default', paid: 'success', overdue: 'destructive',
}

const stageVariant: Record<string, 'default' | 'warning' | 'success' | 'secondary' | 'destructive'> = {
  prospect: 'secondary', outreach: 'default', negotiation: 'warning',
  contracted: 'default', in_progress: 'default', completed: 'success', lost: 'destructive',
}

async function getData(userId: string) {
  const now = new Date()
  const startOfMonth   = new Date(now.getFullYear(), now.getMonth(), 1)
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0)
  const startOfYear    = new Date(now.getFullYear(), 0, 1)

  const [user, revenues, expenses, invoices, deals, contractCount, youtubeConn, sampleCount] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, onboardedAt: true, primaryPlatform: true, primaryPain: true, defaultCurrency: true },
    }),
    db.revenueEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    db.expense.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    db.invoice.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    db.deal.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }),
    db.contract.count({ where: { userId } }),
    db.youTubeConnection.findUnique({ where: { userId }, select: { id: true } }),
    db.revenueEntry.count({ where: { userId, description: { contains: '[SAMPLE]' } } }),
  ])

  if (user && !user.onboardedAt) redirect('/onboarding')

  const isEmpty =
    revenues.length === 0 &&
    expenses.length === 0 &&
    invoices.length === 0 &&
    deals.length === 0 &&
    contractCount === 0 &&
    !youtubeConn

  // This month
  const thisMonthRev  = revenues.filter(r => r.date >= startOfMonth).reduce((s, r) => s + r.amountCents, 0)
  const thisMonthExp  = expenses.filter(e => e.date >= startOfMonth).reduce((s, e) => s + e.amountCents, 0)
  const lastMonthRev  = revenues.filter(r => r.date >= startLastMonth && r.date <= endLastMonth).reduce((s, r) => s + r.amountCents, 0)
  const lastMonthExp  = expenses.filter(e => e.date >= startLastMonth && e.date <= endLastMonth).reduce((s, e) => s + e.amountCents, 0)

  const revPct: number | null  = lastMonthRev  ? ((thisMonthRev - lastMonthRev)   / lastMonthRev)   * 100 : null
  const expPct: number | null  = lastMonthExp  ? ((thisMonthExp - lastMonthExp)   / lastMonthExp)   * 100 : null
  const netProfit     = thisMonthRev - thisMonthExp
  const lastNetProfit = lastMonthRev - lastMonthExp
  const profitPct: number | null = lastNetProfit ? ((netProfit - lastNetProfit) / Math.abs(lastNetProfit)) * 100 : null

  // YTD
  const ytdRev = revenues.filter(r => r.date >= startOfYear).reduce((s, r) => s + r.amountCents, 0)
  const ytdExp = expenses.filter(e => e.date >= startOfYear).reduce((s, e) => s + e.amountCents, 0)

  // Outstanding invoices
  const outstandingCents = invoices
    .filter(i => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + i.totalCents, 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  // Active deals (not completed/lost)
  const activeDeals = deals.filter(d => !['completed', 'lost'].includes(d.stage))

  // 6-month chart
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const month    = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0)
    const label    = month.toLocaleString('default', { month: 'short' })
    const rev = revenues.filter(r => r.date >= month && r.date <= monthEnd).reduce((s, r) => s + r.amountCents, 0)
    const exp = expenses.filter(e => e.date >= month && e.date <= monthEnd).reduce((s, e) => s + e.amountCents, 0)
    return { month: label, revenue: rev, expenses: exp }
  })

  // Revenue by source (all time)
  const bySource: Record<string, number> = {}
  for (const r of revenues) bySource[r.source] = (bySource[r.source] || 0) + r.amountCents
  const breakdownData = Object.entries(bySource).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), value,
  }))

  // Recent activity: merge last 8 revenues + expenses by date
  type ActivityItem = { id: string; date: Date; label: string; sub: string; amountCents: number; type: 'revenue' | 'expense' }
  const activity: ActivityItem[] = [
    ...revenues.slice(0, 20).map(r => ({ id: r.id, date: r.date, label: r.description, sub: r.source.replace('_', ' '), amountCents: r.amountCents, type: 'revenue' as const })),
    ...expenses.slice(0, 20).map(e => ({ id: e.id, date: e.date, label: e.description, sub: e.category, amountCents: e.amountCents, type: 'expense' as const })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8)

  return {
    userName: user?.name ?? 'there',
    currency: user?.defaultCurrency ?? 'USD',
    primaryPlatform: user?.primaryPlatform ?? null,
    primaryPain: user?.primaryPain ?? null,
    stats: { thisMonthRev, thisMonthExp, netProfit, outstandingCents, overdueCount, revPct, expPct, profitPct, ytdRev, ytdExp },
    chartData,
    breakdownData,
    recentInvoices: invoices.slice(0, 5),
    activeDeals: activeDeals.slice(0, 5),
    activity,
    isEmpty,
    youtubeConnected: Boolean(youtubeConn),
    hasSampleData: sampleCount > 0,
  }
}

export default async function DashboardPage() {
  const session = await verifySession()
  const { userName, currency, primaryPlatform, primaryPain, stats, chartData, breakdownData, recentInvoices, activeDeals, activity, isEmpty, youtubeConnected, hasSampleData } = await getData(session.userId)
  const hour = new Date().getHours()
  const youtubeReady = isYoutubeConfigured()

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Dashboard" subtitle="Your creator business at a glance" />
      <main className="flex-1 p-4 sm:p-6 space-y-6">

        {/* Greeting */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{greeting(hour, userName)} 👋</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TourLauncher className="hidden sm:inline-flex" />
            <QuickAddMenu />
          </div>
        </div>

        {isEmpty && (
          <SetupCard
            youtubeConfigured={youtubeReady}
            youtubeAlreadyConnected={youtubeConnected}
            userName={userName}
            primaryPlatform={primaryPlatform}
            primaryPain={primaryPain}
            hasSampleData={hasSampleData}
          />
        )}

        {/* KPI cards */}
        <div data-tour="overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Revenue This Month" valueCents={stats.thisMonthRev} changePct={stats.revPct} icon={TrendingUp} currency={currency} />
          <StatCard title="Expenses This Month" valueCents={stats.thisMonthExp} changePct={stats.expPct} icon={Receipt} positive={false} currency={currency} />
          <StatCard title="Net Profit" valueCents={stats.netProfit} changePct={stats.profitPct} icon={DollarSign} currency={currency} />
          {/* Outstanding invoices card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Outstanding</span>
                  <span className="text-2xl font-bold text-foreground">{formatCurrency(stats.outstandingCents, currency)}</span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
              <div className="mt-4">
                {stats.overdueCount > 0 ? (
                  <span className="text-xs font-medium text-red-500">{stats.overdueCount} overdue invoice{stats.overdueCount > 1 ? 's' : ''}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">No overdue invoices</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* YTD context strip */}
        <div className="flex items-center gap-6 rounded-xl border border-border bg-muted/40 px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year to Date</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-emerald-600">{formatCurrency(stats.ytdRev, currency)}</span>
            <span className="text-xs text-muted-foreground">revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-red-500">{formatCurrency(stats.ytdExp, currency)}</span>
            <span className="text-xs text-muted-foreground">expenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold ${stats.ytdRev - stats.ytdExp >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {formatCurrency(stats.ytdRev - stats.ytdExp, currency)}
            </span>
            <span className="text-xs text-muted-foreground">net profit</span>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={chartData} currency={currency} />
          </div>
          <RevenueBreakdown data={breakdownData.length ? breakdownData : [{ name: 'No data', value: 1 }]} currency={currency} />
        </div>

        {/* Recent invoices + active deals */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Link href="/invoices" className="flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {recentInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No invoices yet</p>
              ) : (
                <div className="space-y-1">
                  {recentInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{inv.clientName}</p>
                        <p className="text-xs text-muted-foreground">{inv.invoiceNumber} · Due {formatDate(inv.dueDate.toISOString())}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(inv.totalCents, currency)}</p>
                        <Badge variant={invoiceStatusVariant[inv.status] ?? 'secondary'}>{inv.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Deals</CardTitle>
              <Link href="/deals" className="flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {activeDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No active deals</p>
              ) : (
                <div className="space-y-1">
                  {activeDeals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{deal.brandName}</p>
                        <p className="text-xs text-muted-foreground">{deal.contactName ?? 'No contact'}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(deal.valueCents, currency)}</p>
                        <Badge variant={stageVariant[deal.stage] ?? 'secondary'}>
                          {deal.stage.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent activity feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No transactions yet</p>
            ) : (
              <div className="space-y-0">
                {activity.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${item.type === 'revenue' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.sub} · {formatDate(item.date.toISOString())}</p>
                    </div>
                    <span className={`text-sm font-semibold shrink-0 ${item.type === 'revenue' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {item.type === 'revenue' ? '+' : '−'}{formatCurrency(item.amountCents, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
