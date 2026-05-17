export interface BenchmarkStats {
  count: number
  totalCount: number
  min: number
  max: number
  p25: number
  median: number
  p75: number
  mean: number
  userSamples: number
  seedSamples: number
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
