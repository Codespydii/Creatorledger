import { Topbar } from '@/components/shared/topbar'
import { BenchmarkFilters } from '@/components/features/benchmarks/benchmark-filters'
import { BenchmarkStatsDisplay } from '@/components/features/benchmarks/benchmark-stats-display'
import { ContributeForm } from '@/components/features/benchmarks/contribute-form'
import { RecentContributions } from '@/components/features/benchmarks/recent-contributions'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { getStats, getRecentContributions } from '@/lib/benchmarks-stats'
import { ensureSeedBenchmarks } from '@/lib/benchmarks-seed'
import { NICHES, PLATFORMS, FORMATS, SUBSCRIBER_TIERS, niceLabel } from '@/lib/benchmarks-constants'

interface Props {
  searchParams: Promise<{ niche?: string; platform?: string; format?: string; subscriberTier?: string }>
}

export default async function BenchmarksPage({ searchParams }: Props) {
  const session = await verifySession()
  const sp = await searchParams

  await ensureSeedBenchmarks()

  const user = await db.user.findUnique({ where: { id: session.userId }, select: { defaultCurrency: true } })
  const currency = user?.defaultCurrency ?? 'USD'

  const filter = {
    niche: sp.niche,
    platform: sp.platform,
    format: sp.format,
    subscriberTier: sp.subscriberTier,
  }

  const [stats, recent] = await Promise.all([
    getStats(filter),
    getRecentContributions(),
  ])

  const filterDescription = [
    filter.subscriberTier ? niceLabel(filter.subscriberTier, SUBSCRIBER_TIERS) + ' subs' : null,
    filter.niche ? niceLabel(filter.niche, NICHES) : null,
    filter.platform ? niceLabel(filter.platform, PLATFORMS) : null,
    filter.format ? niceLabel(filter.format, FORMATS) : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Rate Benchmarks" subtitle="What creators like you actually charge" />
      <main className="flex-1 p-6 space-y-6 max-w-5xl">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              {filterDescription || 'All categories'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Anonymized rates from creator contributions + curated industry data.
            </p>
          </div>
          <ContributeForm />
        </div>

        <BenchmarkFilters initial={filter} />
        <BenchmarkStatsDisplay stats={stats} currency={currency} />
        <RecentContributions contributions={recent} currency={currency} />
      </main>
    </div>
  )
}
