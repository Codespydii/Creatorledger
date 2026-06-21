import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronRight } from 'lucide-react'
import { getAllGuides, formatDate } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'Guides — how to use Caelo & creator bookkeeping',
  description:
    'Step-by-step guides for creators: how to do bookkeeping, track sponsorship income, scan receipts, review contracts and use every Caelo feature.',
  alternates: { canonical: '/guides' },
  openGraph: {
    title: 'Caelo Guides — how to use Caelo',
    description: 'Step-by-step guides for creator bookkeeping and every Caelo feature.',
    url: '/guides',
    type: 'website',
  },
}

export default async function GuidesIndex() {
  const guides = await getAllGuides()

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
      <header className="mb-12 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Caelo Guides</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Learn creator bookkeeping — and how to use Caelo.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Practical, step-by-step guides for running your creator finances and getting the most out of every Caelo
          feature.
        </p>
      </header>

      {/* Flagship guide */}
      <Link
        href="/guides/bookkeeping-for-creators"
        className="group block rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-colors hover:bg-accent"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </span>
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Start here</span>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Bookkeeping for creators: the complete guide
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              How to track every income stream, capture deductions, stay tax-ready, and choose the right software.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Read the guide
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>

      {/* How-to guides */}
      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
          How to use Caelo
        </h2>

        {guides.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Step-by-step guides for every feature are on the way. In the meantime, explore the{' '}
              <Link href="/#features" className="font-medium text-primary hover:underline">
                product features
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-accent"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {g.category && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{g.category}</span>
                    )}
                    <time dateTime={g.date}>{formatDate(g.date)}</time>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-foreground leading-snug">{g.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">{g.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read guide
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
