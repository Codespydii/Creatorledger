import Link from 'next/link'
import { ArrowRight, Check, Minus, ChevronRight, Plus } from 'lucide-react'
import type { Comparison, Cell } from './compare-data'
import { JsonLd, faqPageSchema, breadcrumbSchema } from './structured-data'

// Renders a full /usecaelo-vs-<competitor> page from a single Comparison object.
// Each route file is a thin wrapper that passes its data here.

function CellValue({ value }: { value: Cell }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-emerald-500" aria-label="Yes" />
  if (value === false) return <Minus className="mx-auto h-5 w-5 text-muted-foreground/40" aria-label="No" />
  return <span className="text-xs text-muted-foreground">{value}</span>
}

export function ComparisonView({ data }: { data: Comparison }) {
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Compare', path: '/compare' },
    { name: `Caelo vs ${data.competitor}`, path: `/${data.slug}` },
  ])

  return (
    <div>
      <JsonLd data={[breadcrumb, faqPageSchema(data.faq)]} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 sm:px-6 pt-8">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li><Link href="/compare" className="hover:text-foreground transition-colors">Compare</Link></li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="text-foreground font-medium">vs {data.competitor}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-10 pb-12 sm:pt-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300">
          Comparison · {new Date().getFullYear()}
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          {data.h1}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">{data.intro}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
          >
            Try Caelo free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/#pricing"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            See pricing
          </Link>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8">
            Caelo vs {data.competitor}, feature by feature
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-4 sm:px-5 py-3 font-semibold text-foreground">Feature</th>
                  <th className="px-4 sm:px-5 py-3 text-center font-semibold text-primary">Caelo</th>
                  <th className="px-4 sm:px-5 py-3 text-center font-semibold text-foreground">{data.competitor}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-0">
                    <td className="px-4 sm:px-5 py-3 text-foreground">{row.feature}</td>
                    <td className="px-4 sm:px-5 py-3 text-center"><CellValue value={row.caelo} /></td>
                    <td className="px-4 sm:px-5 py-3 text-center"><CellValue value={row.competitor} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {data.competitor} capabilities and pricing reflect publicly published plans as of {new Date().getFullYear()};
            check their site for current details.
          </p>
        </div>
      </section>

      {/* Honest two-column: where each wins */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Where {data.competitor} is the better fit</h2>
            <ul className="mt-4 space-y-3">
              {data.competitorWins.map((w) => (
                <li key={w} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground/50" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-sm ring-1 ring-primary/10">
            <h2 className="text-lg font-semibold text-foreground">Where Caelo wins for creators</h2>
            <ul className="mt-4 space-y-3">
              {data.caeloWins.map((w) => (
                <li key={w} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Verdict */}
        <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">The bottom line</h2>
          <p className="text-base text-foreground leading-relaxed">{data.verdict}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8">
            Caelo vs {data.competitor}: FAQ
          </h2>
          <div className="space-y-3">
            {data.faq.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-border bg-card p-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer select-none items-start justify-between gap-3 list-none">
                  <span className="font-semibold text-foreground">{q}</span>
                  <Plus aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-gradient-to-b from-violet-50 to-background dark:from-violet-950/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Bookkeeping that actually understands creators.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Track every income stream, scan contracts with AI and forecast your cash — free during the founding beta.
          </p>
          <div className="mt-7 flex flex-col items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/guides/bookkeeping-for-creators" className="text-sm font-medium text-primary hover:underline">
              ← Read the full guide to bookkeeping for creators
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
