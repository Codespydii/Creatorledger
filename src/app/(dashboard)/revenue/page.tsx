import { Topbar } from '@/components/shared/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddRevenueForm } from '@/components/features/revenue/add-revenue-form'
import { RevenueRowActions } from '@/components/features/revenue/revenue-row-actions'
import { CsvImporter } from '@/components/features/shared/csv-importer'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'

const sourceLabels: Record<string, string> = {
  adsense: 'AdSense',
  sponsorship: 'Sponsorship',
  brand_deal: 'Sponsorship',        // legacy → displays as Sponsorship
  affiliate: 'Affiliate',
  tiktok_fund: 'TikTok Fund',
  patreon: 'Patreon',
  substack: 'Substack',
  memberships: 'Memberships',
  podcast: 'Podcast',
  merchandise: 'Merch',
  tips: 'Tips',
  other: 'Other',
}

const sourceBadge: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
  adsense: 'success',
  sponsorship: 'default',
  brand_deal: 'default',
  affiliate: 'warning',
  tiktok_fund: 'success',
  patreon: 'warning',
  substack: 'warning',
  memberships: 'default',
  podcast: 'default',
  merchandise: 'secondary',
  tips: 'success',
  other: 'secondary',
}

export default async function RevenuePage() {
  const session = await verifySession()

  const [user, entries] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { defaultCurrency: true } }),
    db.revenueEntry.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'desc' },
      include: { deal: { select: { brandName: true } } },
    }),
  ])
  const currency = user?.defaultCurrency ?? 'USD'

  const totalCents = entries.reduce((s, e) => s + e.amountCents, 0)

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Revenue" subtitle="Track all your income streams" />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(totalCents, currency)}</p>
          </div>
          <div className="flex items-center gap-2">
            <CsvImporter type="revenue" />
            <AddRevenueForm currency={currency} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Revenue Entries</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {entries.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No revenue entries yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Add your first entry to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">Source</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">Description</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">Platform</th>
                      <th className="pb-3 text-right font-medium text-muted-foreground">Amount</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className={`border-b border-border last:border-0 hover:bg-muted/50 ${entry.isRefund ? 'bg-amber-50/40' : ''}`}>
                        <td className="py-3 text-muted-foreground">{formatDate(entry.date.toISOString())}</td>
                        <td className="py-3">
                          {entry.isRefund ? (
                            <Badge variant="warning">Refund</Badge>
                          ) : (
                            <Badge variant={sourceBadge[entry.source] || 'secondary'}>
                              {sourceLabels[entry.source] || entry.source}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 text-foreground max-w-xs truncate">
                          {entry.description}
                          {entry.deal && (
                            <span className="text-muted-foreground"> · {entry.deal.brandName}</span>
                          )}
                        </td>
                        <td className="py-3 text-muted-foreground">{entry.platform || '—'}</td>
                        <td className={`py-3 text-right font-semibold ${entry.amountCents < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {entry.amountCents < 0 ? '−' : ''}{formatCurrency(Math.abs(entry.amountCents), currency)}
                        </td>
                        <td className="py-3">
                          <RevenueRowActions
                            id={entry.id}
                            source={entry.source}
                            amountCents={entry.amountCents}
                            description={entry.description}
                            platform={entry.platform}
                            date={entry.date.toISOString().split('T')[0]}
                            isRefund={entry.isRefund}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
