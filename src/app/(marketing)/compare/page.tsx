import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ChevronRight, GitCompareArrows } from 'lucide-react'
import { COMPARISONS } from '@/components/marketing/compare-data'
import { JsonLd, breadcrumbSchema } from '@/components/marketing/structured-data'

const url = '/compare'

export const metadata: Metadata = {
  title: 'Caelo vs QuickBooks, Wave & FreshBooks — Creator Comparison',
  description:
    'How Caelo compares to QuickBooks, Wave and FreshBooks for content creators. Side-by-side comparisons of sponsorship tracking, AI contract review, pricing and more.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Caelo vs QuickBooks, Wave & FreshBooks',
    description: 'Side-by-side comparisons of the best bookkeeping tools for creators.',
    url,
    type: 'website',
  },
}

export default function CompareIndex() {
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Compare', path: url },
  ])

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
      <JsonLd data={breadcrumb} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="text-foreground font-medium">Compare</li>
        </ol>
      </nav>

      <header className="mb-12 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Compare</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          How Caelo compares to the alternatives.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Honest, side-by-side comparisons of Caelo against the general-purpose accounting tools creators most often
          consider — including where each one is genuinely the better fit.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {COMPARISONS.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/${c.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-accent"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <GitCompareArrows className="h-5 w-5 text-primary" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-foreground">Caelo vs {c.competitor}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">{c.intro}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Read comparison
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Cross-link to the guide */}
      <div className="mt-12 rounded-2xl border border-border bg-card/40 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          New to creator finances? Start with{' '}
          <Link href="/guides/bookkeeping-for-creators" className="font-medium text-primary hover:underline">
            the complete guide to bookkeeping for creators
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
