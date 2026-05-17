import { Topbar } from '@/components/shared/topbar'
import { AddDealForm } from '@/components/features/deals/add-deal-form'
import { ScanEmailForm } from '@/components/features/deals/scan-email-form'
import { DealPipeline } from '@/components/features/deals/deal-pipeline'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { isGeminiConfigured } from '@/lib/gemini'

export default async function DealsPage() {
  const session = await verifySession()

  const [user, deals] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { defaultCurrency: true } }),
    db.deal.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: 'desc' },
    }),
  ])
  const currency = user?.defaultCurrency ?? 'USD'

  const totalPipelineValue = deals
    .filter((d) => !['completed', 'lost'].includes(d.stage))
    .reduce((s, d) => s + d.valueCents, 0)

  const wonValue = deals
    .filter((d) => d.stage === 'completed')
    .reduce((s, d) => s + d.valueCents, 0)

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Brand Deals" subtitle="Manage your partnership pipeline" />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Pipeline Value</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPipelineValue, currency)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Won This Year</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(wonValue, currency)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Deals</p>
              <p className="text-2xl font-bold text-foreground">{deals.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ScanEmailForm geminiConfigured={isGeminiConfigured()} />
            <AddDealForm currency={currency} />
          </div>
        </div>

        <DealPipeline deals={deals.map((d) => ({
          id: d.id,
          brandName: d.brandName,
          contactName: d.contactName,
          contactEmail: d.contactEmail,
          stage: d.stage,
          valueCents: d.valueCents,
          currency: d.currency,
          startDate: d.startDate?.toISOString().split('T')[0] ?? null,
          endDate: d.endDate?.toISOString().split('T')[0] ?? null,
          deliverables: d.deliverables,
          notes: d.notes,
        }))} currency={currency} />
      </main>
    </div>
  )
}
