import { AlertTriangle, CheckCircle2, ChevronRight, Clock, Coins, FileWarning, Lightbulb, Shield, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ContractAnalysis } from '@/lib/contract-analyzer'

interface Props {
  analysis: ContractAnalysis
}

const SCORE_META: Record<string, { label: string; tone: string; icon: typeof Shield }> = {
  good: {
    label: 'Looks good',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    icon: CheckCircle2,
  },
  fair: {
    label: 'Fair — minor concerns',
    tone: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    icon: Shield,
  },
  risky: {
    label: 'Risky — negotiate before signing',
    tone: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900',
    icon: ShieldAlert,
  },
  predatory: {
    label: 'Predatory — push back hard',
    tone: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
    icon: FileWarning,
  },
}

const SEVERITY_TONES: Record<string, string> = {
  high: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40',
  medium: 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/40',
  low: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
}

const SEVERITY_BADGE: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200',
  medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200',
  low: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200',
}

export function ContractAnalysisView({ analysis }: Props) {
  const scoreMeta = SCORE_META[analysis.overallScore] ?? SCORE_META.fair
  const ScoreIcon = scoreMeta.icon

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-5 flex items-start gap-4 ${scoreMeta.tone}`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 dark:bg-white/10 shrink-0">
          <ScoreIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold">{scoreMeta.label}</h2>
          <p className="mt-1 text-sm leading-relaxed">{analysis.summary}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Coins className="h-4 w-4" /> Payment</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Total</dt>
              <dd className="mt-1 font-medium text-foreground">{analysis.payment.totalAmount ?? 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Schedule</dt>
              <dd className="mt-1 font-medium text-foreground">{analysis.payment.schedule ?? 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Kill fee</dt>
              <dd className="mt-1 font-medium text-foreground">{analysis.payment.killFee ?? 'Not specified'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Deliverables</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {analysis.deliverables.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deliverables specified.</p>
          ) : (
            <ul className="space-y-2">
              {analysis.deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{d.item}</p>
                    {d.deadline && (
                      <p className="text-xs text-muted-foreground mt-0.5">Due {d.deadline}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage Rights</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3 text-sm">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Duration</span>
              <p className="mt-1 text-foreground">{analysis.usageRights.duration}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Platforms</span>
              <p className="mt-1 text-foreground">
                {analysis.usageRights.platforms.length > 0 ? analysis.usageRights.platforms.join(', ') : 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Brand can modify</span>
              <p className="mt-1 text-foreground">{analysis.usageRights.modifications}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exclusivity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3 text-sm">
            {analysis.exclusivity.exists ? (
              <>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Category</span>
                  <p className="mt-1 text-foreground">{analysis.exclusivity.category ?? 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Duration</span>
                  <p className="mt-1 text-foreground">{analysis.exclusivity.duration ?? 'Not specified'}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No exclusivity clause detected.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {analysis.redFlags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Red flags</CardTitle>
            <CardDescription>Items worth pushing back on before you sign.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {analysis.redFlags.map((flag, i) => (
              <div key={i} className={`rounded-lg border p-3 ${SEVERITY_TONES[flag.severity]}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${SEVERITY_BADGE[flag.severity]}`}>
                    {flag.severity}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{flag.issue}</span>
                </div>
                <p className="mt-1.5 text-sm text-foreground/80 leading-relaxed">{flag.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {analysis.missingClauses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missing protections</CardTitle>
            <CardDescription>Important clauses that aren&apos;t in the contract.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {analysis.missingClauses.map((m, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <FileWarning className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {analysis.negotiationSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="h-4 w-4" /> What to negotiate</CardTitle>
            <CardDescription>Counter-offers ranked by impact, in priority order.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ol className="space-y-3">
              {analysis.negotiationSuggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
