import 'server-only'
import { db } from './db'
import { benchmarkConfidence, type BenchmarkStats } from './benchmarks-types'

export type { BenchmarkStats } from './benchmarks-types'
export { scoreOffer } from './benchmarks-types'

// Fraction trimmed from each tail before computing stats, and the minimum
// sample size at which trimming kicks in (below this, every point counts).
const TRIM_FRACTION = 0.05
const TRIM_MIN_SAMPLES = 20

/** Drop the extreme tails so a single troll/typo can't swing a slice's median. */
function trimTails(sorted: number[]): number[] {
  const n = sorted.length
  if (n < TRIM_MIN_SAMPLES) return sorted
  const k = Math.floor(n * TRIM_FRACTION)
  if (k === 0) return sorted
  return sorted.slice(k, n - k)
}

export interface BenchmarkFilter {
  niche?: string
  platform?: string
  format?: string
  subscriberTier?: string
}

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0
  if (sortedValues.length === 1) return sortedValues[0]
  const idx = (sortedValues.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sortedValues[lo]
  const frac = idx - lo
  return sortedValues[lo] * (1 - frac) + sortedValues[hi] * frac
}

export async function getStats(filter: BenchmarkFilter): Promise<BenchmarkStats> {
  const where: Record<string, unknown> = {}
  if (filter.niche) where.niche = filter.niche
  if (filter.platform) where.platform = filter.platform
  if (filter.format) where.format = filter.format
  if (filter.subscriberTier) where.subscriberTier = filter.subscriberTier

  const records = await db.rateBenchmark.findMany({
    where,
    select: { amountCents: true, source: true },
  })

  const totalCount = records.length
  if (totalCount === 0) {
    return {
      count: 0, totalCount: 0, min: 0, max: 0, p25: 0, median: 0, p75: 0, mean: 0,
      userSamples: 0, verifiedSamples: 0, seedSamples: 0, confidence: 'estimate', trimmedOutliers: 0,
    }
  }

  const userSamples = records.filter((r) => r.source === 'user').length
  const verifiedSamples = records.filter((r) => r.source === 'verified').length
  const seedSamples = totalCount - userSamples - verifiedSamples

  // Sort, then trim the extreme tails so outliers don't distort the percentiles.
  const sorted = records.map((r) => r.amountCents).sort((a, b) => a - b)
  const values = trimTails(sorted)
  const trimmedOutliers = sorted.length - values.length

  return {
    // count/totalCount report the full slice; the stats below use the trimmed set.
    count: totalCount,
    totalCount,
    min: values[0],
    max: values[values.length - 1],
    p25: Math.round(percentile(values, 0.25)),
    median: Math.round(percentile(values, 0.5)),
    p75: Math.round(percentile(values, 0.75)),
    mean: Math.round(values.reduce((s, v) => s + v, 0) / values.length),
    userSamples,
    verifiedSamples,
    seedSamples,
    confidence: benchmarkConfidence(userSamples, verifiedSamples),
    trimmedOutliers,
  }
}

export interface RecentBenchmark {
  niche: string
  platform: string
  format: string
  subscriberTier: string
  amountCents: number
  exclusivity: boolean
  source: string
  reportedAt: Date
}

export async function getRecentContributions(limit = 8): Promise<RecentBenchmark[]> {
  return db.rateBenchmark.findMany({
    where: { source: { in: ['user', 'verified'] } },
    orderBy: { reportedAt: 'desc' },
    take: limit,
    select: {
      niche: true,
      platform: true,
      format: true,
      subscriberTier: true,
      amountCents: true,
      exclusivity: true,
      source: true,
      reportedAt: true,
    },
  })
}
