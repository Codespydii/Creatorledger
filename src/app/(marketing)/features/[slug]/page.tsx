import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react'
import { FEATURES, getFeature, type Feature } from '@/components/marketing/nav-data'

interface Props {
  params: Promise<{ slug: string }>
}

// Pre-render one static page per feature; anything else 404s.
export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const f = getFeature(slug)
  if (!f) return {}
  const url = `/features/${f.slug}`
  return {
    title: f.metaTitle,
    description: f.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: f.metaTitle,
      description: f.metaDescription,
      url,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: f.metaTitle, description: f.metaDescription },
  }
}

const TONES: Record<Feature['color'], { chip: string; iconWrap: string }> = {
  violet: { chip: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300', iconWrap: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  emerald: { chip: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300', iconWrap: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  amber: { chip: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300', iconWrap: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  red: { chip: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300', iconWrap: 'bg-red-500/10 text-red-600 dark:text-red-400' },
}

export default async function FeaturePage({ params }: Props) {
  const { slug } = await params
  const f = getFeature(slug)
  if (!f) notFound()

  const tone = TONES[f.color]
  const others = FEATURES.filter((o) => o.slug !== f.slug)

  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 sm:px-6 pt-8">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="text-foreground font-medium">{f.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-10 pb-14 sm:pt-14 sm:pb-20">
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tone.chip}`}>
          <f.icon className="h-3.5 w-3.5" />
          {f.eyebrow}
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          {f.headline}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">{f.subhead}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
          >
            Join Free Beta <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/#pricing"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            See pricing
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {f.benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.iconWrap}`}>
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore more features */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
          Explore more of Caelo
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/features/${o.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <o.icon className="h-4 w-4 text-primary" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{o.name}</span>
                <span className="block text-xs text-muted-foreground truncate">{o.tagline}</span>
              </span>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Run your whole creator business in one place.
          </h2>
          <p className="mt-3 text-muted-foreground">
            {f.name} is one part of Caelo — the financial OS built for full-time creators.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
          >
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
