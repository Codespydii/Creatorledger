import { Topbar } from '@/components/shared/topbar'
import { AddDealForm } from '@/components/features/deals/add-deal-form'
import { ScanEmailForm } from '@/components/features/deals/scan-email-form'
import { DealPipeline } from '@/components/features/deals/deal-pipeline'
import { PastDeals } from '@/components/features/deals/past-deals'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { isGeminiConfigured } from '@/lib/gemini'
import { mapProfilePlatform, mapProfileTier, validNicheOrEmpty } from '@/lib/benchmarks-constants'

// How long a closed deal lingers on the active board before moving to "Past deals".
const COMPLETED_GRACE_DAYS = 30 // matches the Net-30 wrap-up/payment cycle
const LOST_GRACE_DAYS = 7 // nothing to wrap up — archive sooner
const PAST_LIMIT = 50

export default async function DealsPage() {
  const session = await verifySession()
  const userId = session.userId

  const now = Date.now()
  const completedCutoff = new Date(now - COMPLETED_GRACE_DAYS * 86_400_000)
  const lostCutoff = new Date(now - LOST_GRACE_DAYS * 86_400_000)

  // A closed deal is "past" once it's beyond its grace window. Null closedAt is
  // treated as recent (stays on the board) so nothing can silently vanish.
  const pastWhere = {
    userId,
    OR: [
      { stage: 'completed', closedAt: { lt: completedCutoff } },
      { stage: 'lost', closedAt: { lt: lostCutoff } },
    ],
  }

  const [user, boardDeals, pastDeals, pastCount, wonCount, lostCount, pipelineAgg, wonAgg, totalDeals] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { defaultCurrency: true, primaryPlatform: true, audienceTier: true, niche: true },
      }),
      db.deal.findMany({
        where: {
          userId,
          OR: [
            { stage: { notIn: ['completed', 'lost'] } },
            { stage: 'completed', OR: [{ closedAt: null }, { closedAt: { gte: completedCutoff } }] },
            { stage: 'lost', OR: [{ closedAt: null }, { closedAt: { gte: lostCutoff } }] },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { revenues: true } }, benchmark: { select: { id: true } } },
      }),
      db.deal.findMany({
        where: pastWhere,
        orderBy: { closedAt: 'desc' },
        take: PAST_LIMIT,
        include: { _count: { select: { revenues: true } }, benchmark: { select: { id: true } } },
      }),
      db.deal.count({ where: pastWhere }),
      db.deal.count({ where: { userId, stage: 'completed' } }),
      db.deal.count({ where: { userId, stage: 'lost' } }),
      db.deal.aggregate({ where: { userId, stage: { notIn: ['completed', 'lost'] } }, _sum: { valueCents: true } }),
      db.deal.aggregate({ where: { userId, stage: 'completed' }, _sum: { valueCents: true } }),
      db.deal.count({ where: { userId } }),
    ])

  const currency = user?.defaultCurrency ?? 'USD'
  const totalPipelineValue = pipelineAgg._sum.valueCents ?? 0
  const wonValue = wonAgg._sum.valueCents ?? 0

  // Best-guess benchmark dimensions to pre-fill the "contribute this rate" flow.
  const contributeDefaults = {
    platform: mapProfilePlatform(user?.primaryPlatform),
    subscriberTier: mapProfileTier(user?.audienceTier),
    niche: validNicheOrEmpty(user?.niche),
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Brand Deals" subtitle="Manage your partnership pipeline" />
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div data-tour="deals" className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-6">
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
              <p className="text-2xl font-bold text-foreground">{totalDeals}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ScanEmailForm geminiConfigured={isGeminiConfigured()} />
            <AddDealForm currency={currency} autoOpen />
          </div>
        </div>

        <DealPipeline
          deals={boardDeals.map((d) => ({
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
            hasRevenue: d._count.revenues > 0,
            alreadyContributed: !!d.benchmark,
          }))}
          currency={currency}
          contributeDefaults={contributeDefaults}
        />

        <PastDeals
          deals={pastDeals.map((d) => ({
            id: d.id,
            brandName: d.brandName,
            contactName: d.contactName,
            contactEmail: d.contactEmail,
            stage: d.stage,
            valueCents: d.valueCents,
            currency: d.currency,
            deliverables: d.deliverables,
            startDate: d.startDate?.toISOString().split('T')[0] ?? null,
            endDate: d.endDate?.toISOString().split('T')[0] ?? null,
            notes: d.notes,
            closedAt: d.closedAt?.toISOString() ?? null,
            hasRevenue: d._count.revenues > 0,
            alreadyContributed: !!d.benchmark,
          }))}
          total={pastCount}
          wonCount={wonCount}
          lostCount={lostCount}
          currency={currency}
          contributeDefaults={contributeDefaults}
        />
      </main>
    </div>
  )
}
