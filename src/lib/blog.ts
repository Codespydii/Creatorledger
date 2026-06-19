import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { ComponentType } from 'react'

// Blog posts are plain MDX files in src/content/blog/*.mdx. Each file exports a
// `meta` object (frontmatter) and the MDX body as the default export. Publishing
// a post = add a file here and deploy. @next/mdx doesn't parse YAML frontmatter,
// so we use an exported `meta` const instead.
const BLOG_DIR = join(process.cwd(), 'src', 'content', 'blog')

export interface PostMeta {
  title: string
  description: string
  /** ISO date, e.g. 2026-06-10 */
  date: string
  author?: string
  tags?: string[]
  /** Optional cover image, e.g. "/blog/my-post-cover.jpg" (lives in /public). */
  cover?: string
}

export interface PostSummary extends PostMeta {
  slug: string
}

export interface LoadedPost {
  /** The MDX body as a React component. */
  default: ComponentType
  meta: PostMeta
}

/**
 * Dynamically import one post's MDX module. `@types/mdx` only types the default
 * export, so we assert the `meta` named export here in one place. Keeping the
 * templated import centralized also gives the bundler a single dynamic-import
 * context to build.
 */
export async function loadPost(slug: string): Promise<LoadedPost> {
  const mod = await import(`@/content/blog/${slug}.mdx`)
  return mod as unknown as LoadedPost
}

/** Filenames (without extension) of every post. Runs at build time. */
export function getPostSlugs(): string[] {
  try {
    return readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, ''))
  } catch {
    return []
  }
}

/** All posts with their metadata, newest first. */
export async function getAllPosts(): Promise<PostSummary[]> {
  const slugs = getPostSlugs()
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const { meta } = await loadPost(slug)
      return { slug, ...meta }
    }),
  )
  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
