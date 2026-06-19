import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAllPosts, formatDate } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog — creator finance, taxes & brand deals',
  description:
    'Playbooks and guides on creator finance: managing taxes, pricing brand deals, reading sponsorship contracts and forecasting lumpy income.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Caelo Blog — creator finance playbooks',
    description: 'Guides on creator taxes, brand deals, contracts and cash flow.',
    url: '/blog',
    type: 'website',
  },
}

export default async function BlogIndex() {
  const posts = await getAllPosts()

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
      <header className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Caelo Blog</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Money playbooks for creators.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Practical guides on taxes, brand deals, contracts and cash flow — written for people who run a
          business of one.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet — check back soon.</p>
      ) : (
        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.slug} className="group">
              <Link
                href={`/blog/${post.slug}`}
                className="block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors hover:bg-accent"
              >
                {post.cover && (
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={post.cover}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </div>
                )}
                <div className="p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  {post.tags?.map((tag) => (
                    <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 text-xl font-semibold text-foreground">{post.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{post.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
