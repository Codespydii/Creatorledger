import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAllPosts, formatDate } from '@/lib/blog'
import { Badge } from '@/components/ui/badge'
import { BlogCover } from '@/components/marketing/blog-cover'

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
  const [featured, ...rest] = posts

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
      <header className="mb-12 max-w-2xl">
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
        <>
          {/* Featured — latest post */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md lg:grid-cols-2"
          >
            <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:min-h-full">
              <BlogCover post={featured} priority sizes="(max-width: 1024px) 100vw, 576px" />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Featured</span>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {featured.tags?.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
                <time dateTime={featured.date}>{formatDate(featured.date)}</time>
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {featured.title}
              </h2>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed line-clamp-3">
                {featured.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Read more
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>

          {/* Rest — grid */}
          {rest.length > 0 && (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <BlogCover post={post} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {post.tags?.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                      </div>
                      <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">{post.title}</h3>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {post.description}
                      </p>
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
        </>
      )}
    </div>
  )
}
