import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { ComponentType } from 'react'

// Guides are how-to articles (how to use each Caelo feature, getting started)
// written as MDX in src/content/guides/*.mdx. Mirrors the blog system on
// purpose: same `meta`-export convention, same `draft` safety, same MDX styling
// from src/mdx-components.tsx. Distinct from the blog (finance thought-
// leadership) — guides teach the product.
const GUIDES_DIR = join(process.cwd(), 'src', 'content', 'guides')

export interface GuideMeta {
  title: string
  description: string
  /** ISO date, e.g. 2026-06-22 */
  date: string
  /** Optional grouping, e.g. "Getting started" | "Using Caelo". */
  category?: string
  /** Optional feature slug this guide explains, e.g. "income-tracking" — used to
   *  cross-link the guide to its /features/<slug> page. */
  feature?: string
  /** Optional cover image in /public. */
  cover?: string
  /**
   * When true the guide is excluded from the guides index, the sitemap, and
   * static generation (the URL 404s). Use it for work-in-progress drafts and the
   * starter template.
   */
  draft?: boolean
}

export interface GuideSummary extends GuideMeta {
  slug: string
}

export interface LoadedGuide {
  default: ComponentType
  meta: GuideMeta
}

/** Dynamically import one guide's MDX module. */
export async function loadGuide(slug: string): Promise<LoadedGuide> {
  const mod = await import(`@/content/guides/${slug}.mdx`)
  return mod as unknown as LoadedGuide
}

/** Filenames (without extension) of every guide MDX file. Runs at build time. */
export function getGuideSlugs(): string[] {
  try {
    return readdirSync(GUIDES_DIR)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, ''))
  } catch {
    return []
  }
}

/**
 * Slugs of every *publishable* guide (drafts excluded). Use for crawler-facing
 * surfaces — the sitemap and the [slug] route's generateStaticParams — so drafts
 * never get a URL or sitemap entry.
 */
export async function getPublishedGuideSlugs(): Promise<string[]> {
  const slugs = getGuideSlugs()
  const withMeta = await Promise.all(
    slugs.map(async (slug) => ({ slug, meta: (await loadGuide(slug)).meta })),
  )
  return withMeta.filter(({ meta }) => !meta.draft).map(({ slug }) => slug)
}

/** All published guides with metadata, newest first (drafts excluded). */
export async function getAllGuides(): Promise<GuideSummary[]> {
  const slugs = getGuideSlugs()
  const guides = await Promise.all(
    slugs.map(async (slug) => {
      const { meta } = await loadGuide(slug)
      return { slug, ...meta }
    }),
  )
  return guides
    .filter((g) => !g.draft)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
