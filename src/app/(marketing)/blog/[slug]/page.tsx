import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { getPostSlugs, loadPost, formatDate } from '@/lib/blog'

interface Props {
  params: Promise<{ slug: string }>
}

const SITE_URL = 'https://usecaelo.com'

// Pre-render every post; unknown slugs 404 (dynamicParams = false).
export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { meta } = await loadPost(slug)
  const url = `/blog/${slug}`
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
      authors: meta.author ? [meta.author] : undefined,
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const { default: Post, meta } = await loadPost(slug)

  // Article structured data so Google can render rich results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.date,
    author: { '@type': 'Organization', name: meta.author ?? 'Caelo' },
    publisher: {
      '@type': 'Organization',
      name: 'Caelo',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/caelo-logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${slug}` },
  }

  return (
    <article className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
        </ol>
      </nav>

      {/* Post header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          {meta.author && <span>· {meta.author}</span>}
          {meta.tags?.map((tag) => (
            <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{meta.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{meta.description}</p>
      </header>

      {meta.cover && (
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border">
          <Image
            src={meta.cover}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>
      )}

      <hr className="border-border" />

      {/* MDX body (styled via src/mdx-components.tsx) */}
      <Post />

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
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
        <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
          ← Back to all posts
        </Link>
      </div>
    </article>
  )
}
