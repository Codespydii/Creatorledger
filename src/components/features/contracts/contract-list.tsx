import Link from 'next/link'
import { FileText, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

interface ContractRow {
  id: string
  title: string
  brandName: string | null
  overallScore: string | null
  createdAt: Date
}

interface Props {
  contracts: ContractRow[]
}

const SCORE_STYLES: Record<string, string> = {
  good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  fair: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  risky: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
  predatory: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
}

const SCORE_LABELS: Record<string, string> = {
  good: 'Good',
  fair: 'Fair',
  risky: 'Risky',
  predatory: 'Predatory',
}

export function ContractList({ contracts }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Past analyses</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {contracts.length === 0 ? (
          <div className="py-10 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No contracts analyzed yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload your next sponsorship brief above to get an instant risk review.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {contracts.map((c) => (
              <Link
                key={c.id}
                href={`/contracts/${c.id}`}
                className="flex items-center gap-3 py-3 border-b border-border last:border-0 hover:bg-accent/40 rounded-lg px-2 -mx-2 transition-colors"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.brandName ? `${c.brandName} · ` : ''}
                    {formatDate(c.createdAt.toISOString())}
                  </p>
                </div>
                {c.overallScore && (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md ${SCORE_STYLES[c.overallScore] ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {SCORE_LABELS[c.overallScore] ?? c.overallScore}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
