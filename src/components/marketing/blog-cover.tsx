import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { PostSummary } from '@/lib/blog'

/**
 * Whether a post has a real, post-specific cover. The generic site OG image
 * (`/og.png`) is treated as "no cover" so it never renders as a card thumbnail.
 */
export function hasRealCover(post: Pick<PostSummary, 'cover'>): boolean {
  return Boolean(post.cover) && post.cover !== '/og.png'
}

interface BlogCoverProps {
  post: Pick<PostSummary, 'cover' | 'title'>
  /** Responsive sizes hint for next/image. */
  sizes: string
  priority?: boolean
  className?: string
}

/**
 * Renders a blog post's cover image, or a branded violet-gradient placeholder
 * (with the post title) when the post has no real cover — so the index grid
 * stays uniform without requiring an image asset for every post. Meant to fill
 * an aspect-ratio / sized wrapper provided by the caller.
 */
export function BlogCover({ post, sizes, priority, className }: BlogCoverProps) {
  if (hasRealCover(post)) {
    return (
      <Image
        src={post.cover as string}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className={cn('object-cover transition-transform duration-300 group-hover:scale-105', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col justify-end bg-gradient-to-br from-primary to-violet-900 p-5',
        className,
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Caelo</span>
      <span className="mt-1 text-lg font-semibold leading-snug text-white">{post.title}</span>
    </div>
  )
}
