import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { getPublishedGuideSlugs, loadGuide, formatDate } from '@/lib/guides'
import { getFeature } from '@/components/marketing/nav-data'
import { JsonLd, breadcrumbSchema } from '@/components/marketing/structured-data'

interface Props {
  params: Promise<{ slug: string }>
}

const SITE_URL = 'https://usecaelo.com'

// Pre-render every published guide; drafts and unknown slugs 404.
export async function generateStaticParams() {
  return (await getPublishedGuideSlugs()).map((slug) => ({ slug }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { meta } = await loadGuide(slug)
  const url = `/guides/${slug}`
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      type: 'article',
      publishedTime: meta.date,
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
  }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const { default: Guide, meta } = await loadGuide(slug)
  const feature = meta.feature ? getFeature(meta.feature) : undefined

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.date,
    author: { '@type': 'Organization', name: 'Caelo' },
    publisher: {
      '@type': 'Organization',
      name: 'Caelo',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/caelo-logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/guides/${slug}` },
  }
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: meta.title, path: `/guides/${slug}` },
  ])

  return (
    <article className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
      <JsonLd data={[articleSchema, breadcrumb]} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li><Link href="/guides" className="hover:text-foreground transition-colors">Guides</Link></li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          {meta.category && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{meta.category}</span>
          )}
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{meta.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{meta.description}</p>
      </header>

      <hr className="border-border" />

      {/* MDX body (styled via src/mdx-components.tsx) */}
      <Guide />

      {/* Cross-link to the feature this guide explains */}
      {feature && (
        <div className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Related feature</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">{feature.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{feature.tagline}</p>
          <Link
            href={`/features/${feature.slug}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Explore {feature.name} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Run your creator finances in one place</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Caelo tracks income, scans receipts, reviews contracts and forecasts your cash — built for creators.
        </p>
        <Link
          href="/signup"
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
        >
          Join the free beta <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8">
        <Link href="/guides" className="text-sm font-medium text-primary hover:underline">
          ← Back to all guides
        </Link>
      </div>
    </article>
  )
}
