export type BenchmarkConfidence = 'estimate' | 'emerging' | 'community' | 'verified'

export interface BenchmarkStats {
  count: number
  totalCount: number
  min: number
  max: number
  p25: number
  median: number
  p75: number
  mean: number
  /** Self-reported (unverified) creator contributions. */
  userSamples: number
  /** Contributions linked to a real, paid, completed deal — highest trust. */
  verifiedSamples: number
  seedSamples: number
  /** How much of this slice is real creator-reported data vs modeled estimate. */
  confidence: BenchmarkConfidence
  /** Number of extreme values dropped from the tails before computing the stats. */
  trimmedOutliers: number
}

/**
 * Trust tier for a slice. A single verified (paid-deal-linked) contribution
 * promotes the slice to the top tier; otherwise it scales with how many real
 * self-reported deals back it. Seed/estimate data alone never reads as real.
 */
export function benchmarkConfidence(userSamples: number, verifiedSamples = 0): BenchmarkConfidence {
  if (verifiedSamples > 0) return 'verified'
  if (userSamples === 0) return 'estimate'
  if (userSamples < 10) return 'emerging'
  return 'community'
}

export function scoreOffer(offerCents: number, stats: BenchmarkStats): {
  verdict: 'below' | 'within' | 'above' | 'unknown'
  message: string
  pctVsMedian: number
} {
  if (stats.count === 0 || offerCents <= 0) {
    return { verdict: 'unknown', message: 'Not enough data to score this offer.', pctVsMedian: 0 }
  }
  const pct = ((offerCents - stats.median) / stats.median) * 100
  if (offerCents < stats.p25) {
    return {
      verdict: 'below',
      message: `${Math.abs(Math.round(pct))}% below the median for this category. Push back.`,
      pctVsMedian: pct,
    }
  }
  if (offerCents > stats.p75) {
    return {
      verdict: 'above',
      message: `${Math.round(pct)}% above the median — strong offer.`,
      pctVsMedian: pct,
    }
  }
  return {
    verdict: 'within',
    message: 'Within the typical range for this category.',
    pctVsMedian: pct,
  }
}
