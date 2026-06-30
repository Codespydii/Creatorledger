import Image from 'next/image'
import type { ReactNode } from 'react'

interface BlogFigureProps {
  /** Path under /public, e.g. "/blog/creator-media-kit.jpg". */
  src: string
  alt: string
  /** Intrinsic pixel width of the source file — reserves space to prevent CLS. */
  width: number
  /** Intrinsic pixel height of the source file. */
  height: number
  caption?: ReactNode
}

/**
 * Inline image for MDX blog bodies. Wraps next/image so body images get the
 * same automatic resizing, WebP/AVIF negotiation, responsive srcset and
 * lazy-loading the cover/hero images already get — and, crucially, reserves
 * layout space via explicit width/height (raw <img> in markdown can't, which
 * causes cumulative layout shift). Exposed to MDX as <Figure> in
 * src/mdx-components.tsx.
 */
export function BlogFigure({ src, alt, width, height, caption }: BlogFigureProps) {
  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 100vw, 672px"
        className="h-auto w-full rounded-xl border border-border"
      />
      {caption ? (
        <figcaption className="mt-2 text-center text-sm italic text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  )
}
