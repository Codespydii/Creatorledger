import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

// Global styling for every MDX file in the app (blog posts live in
// src/content/blog/*.mdx). Rather than pull in @tailwindcss/typography, we map
// each HTML element MDX produces to Tailwind classes that match the Caelo
// design system. Required by @next/mdx with the App Router.
const components: MDXComponents = {
  h1: (props: ComponentPropsWithoutRef<'h1'>) => (
    <h1 className="mt-2 mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<'h2'>) => (
    <h2 className="mt-12 mb-4 text-2xl font-bold tracking-tight text-foreground scroll-mt-24" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground scroll-mt-24" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<'p'>) => (
    <p className="my-4 text-base leading-relaxed text-muted-foreground" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<'ul'>) => (
    <ul className="my-4 list-disc space-y-2 pl-6 text-base text-muted-foreground marker:text-primary" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<'ol'>) => (
    <ol className="my-4 list-decimal space-y-2 pl-6 text-base text-muted-foreground marker:text-muted-foreground" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<'li'>) => <li className="pl-1 leading-relaxed" {...props} />,
  a: ({ href = '#', ...props }: ComponentPropsWithoutRef<'a'>) => {
    const isInternal = href.startsWith('/') || href.startsWith('#')
    if (isInternal) {
      return <Link href={href} className="font-medium text-primary underline-offset-2 hover:underline" {...props} />
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline-offset-2 hover:underline"
        {...props}
      />
    )
  },
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="my-6 border-l-4 border-primary/40 bg-muted/40 py-2 pl-5 pr-4 text-base italic text-foreground/80"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<'code'>) => (
    <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<'pre'>) => (
    <pre className="my-6 overflow-x-auto rounded-xl border border-border bg-muted/60 p-4 text-sm [&_code]:bg-transparent [&_code]:p-0" {...props} />
  ),
  hr: (props: ComponentPropsWithoutRef<'hr'>) => <hr className="my-10 border-border" {...props} />,
  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<'h4'>) => (
    <h4 className="mt-6 mb-2 text-lg font-semibold text-foreground" {...props} />
  ),
  img: (props: ComponentPropsWithoutRef<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="my-6 w-full rounded-xl border border-border" alt={props.alt ?? ''} {...props} />
  ),
  figure: (props: ComponentPropsWithoutRef<'figure'>) => <figure className="my-8" {...props} />,
  figcaption: (props: ComponentPropsWithoutRef<'figcaption'>) => (
    <figcaption className="mt-2 text-center text-sm italic text-muted-foreground" {...props} />
  ),
}

export function useMDXComponents(): MDXComponents {
  return components
}
