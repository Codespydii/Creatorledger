import { Topbar } from '@/components/shared/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddRevenueForm } from '@/components/features/revenue/add-revenue-form'
import { RevenueTable } from '@/components/features/revenue/revenue-table'
import { CsvImporter } from '@/components/features/shared/csv-importer'
import { ExportRevenueButton } from '@/components/features/revenue/export-revenue-button'
import { EmptyState } from '@/components/shared/empty-state'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

export default async function RevenuePage() {
  const session = await verifySession()

  const [user, entries, deals] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { defaultCurrency: true } }),
    db.revenueEntry.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'desc' },
      include: { deal: { select: { brandName: true } } },
    }),
    db.deal.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, brandName: true },
    }),
  ])
  const currency = user?.defaultCurrency ?? 'USD'

  const totalCents = entries.reduce((s, e) => s + e.amountCents, 0)

  const rows = entries.map((e) => ({
    id: e.id,
    date: e.date.toISOString(),
    source: e.source,
    description: e.description,
    platform: e.platform,
    amountCents: e.amountCents,
    isRefund: e.isRefund,
    dealBrandName: e.deal?.brandName ?? null,
  }))

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Revenue" subtitle="Track all your income streams" />
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div data-tour="revenue" className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(totalCents, currency)}</p>
          </div>
          <div className="flex items-center gap-2">
            <CsvImporter type="revenue" />
            <ExportRevenueButton rows={rows} currency={currency} />
            <AddRevenueForm currency={currency} autoOpen deals={deals} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Revenue Entries</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {rows.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No revenue yet"
                description="Log payments from sponsorships, AdSense, memberships, and more. You can also import a CSV from your bank or platform."
                action={<AddRevenueForm currency={currency} deals={deals} />}
              />
            ) : (
              <RevenueTable rows={rows} currency={currency} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
