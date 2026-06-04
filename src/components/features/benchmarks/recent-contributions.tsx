import { Users, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { NICHES, PLATFORMS, FORMATS, SUBSCRIBER_TIERS, niceLabel } from '@/lib/benchmarks-constants'
import type { RecentBenchmark } from '@/lib/benchmarks-stats'

function bucketTimeAgo(date: Date): string {
  const hours = (Date.now() - date.getTime()) / (1000 * 60 * 60)
  if (hours < 24) return 'today'
  if (hours < 24 * 7) return 'this week'
  if (hours < 24 * 30) return 'this month'
  if (hours < 24 * 90) return 'this quarter'
  return 'earlier'
}

function bucketAmount(cents: number): number {
  return Math.round(cents / 5000) * 5000
}

interface Props {
  contributions: RecentBenchmark[]
  currency?: string
}

export function RecentContributions({ contributions, currency = 'USD' }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Latest contributions</CardTitle>
        <CardDescription>Anonymous deals shared by other creators.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {contributions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No creator contributions yet. Be the first.
          </p>
        ) : (
          <div className="space-y-2">
            {contributions.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <span>{niceLabel(c.niche, NICHES)} · {niceLabel(c.platform, PLATFORMS)} · {niceLabel(c.format, FORMATS)}</span>
                    {c.source === 'verified' && (
                      <span
                        title="Verified from a real, paid deal"
                        className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300 shrink-0"
                      >
                        <ShieldCheck className="h-2.5 w-2.5" aria-hidden="true" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {niceLabel(c.subscriberTier, SUBSCRIBER_TIERS)} subs
                    {c.exclusivity ? ' · with exclusivity' : ''}
                    {' · '}{bucketTimeAgo(c.reportedAt)}
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground shrink-0 ml-3">
                  ~{formatCurrency(bucketAmount(c.amountCents), currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
