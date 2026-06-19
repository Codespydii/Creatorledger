import type { MetadataRoute } from 'next'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { FEATURES } from '@/components/marketing/nav-data'
import { getPostSlugs } from '@/lib/blog'

const BASE_URL = 'https://usecaelo.com'

// App Router root for this project (uses the `src/` convention).
const APP_DIR = join(process.cwd(), 'src', 'app')

// Special files that live alongside a route but are not themselves pages.
const NON_PAGE_FILES = new Set(['layout.tsx', 'loading.tsx', 'error.tsx', 'not-found.tsx'])

// Route-group folders whose contents are not public marketing pages. The whole
// group is skipped during traversal, so every authenticated/auth-flow route
// inside `(auth)` (login, signup, forgot-password, reset-password, onboarding)
// and `(dashboard)` (dashboard, settings, revenue, invoices, …) is excluded.
const EXCLUDED_GROUPS = new Set(['(auth)', '(dashboard)'])

// Belt-and-suspenders prefix filter for the explicitly-named auth routes and
// for non-marketing pages that live OUTSIDE a route group (admin, internal
// print pages). A route is dropped if it equals or sits under any prefix. The
// scan stays automatic, so new *public* marketing pages are still picked up
// with no edits.
const EXCLUDED_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/dashboard',
  '/spiral', // admin
  '/report-pdf', // internal PDF render route
]

function isExcluded(path: string): boolean {
  return EXCLUDED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/**
 * Recursively walk the app directory and collect the URL path of every folder
 * that contains a `page.tsx`. Route groups (folders wrapped in parentheses,
 * e.g. `(auth)`) are stripped from the URL. Skipped entirely: `api` routes,
 * private folders (`_components` and anything prefixed with `_`), and dynamic
 * segments (`[id]`) — the latter can't be enumerated to a concrete URL.
 *
 * Runs at build time (the sitemap is statically generated), so the source tree
 * is present on disk.
 */
function collectRoutes(dir: string, segments: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  const routes: string[] = []

  const hasPage = entries.some(
    (e) => e.isFile() && e.name === 'page.tsx' && !NON_PAGE_FILES.has(e.name),
  )
  if (hasPage) {
    const urlSegments = segments.filter((s) => !s.startsWith('(')) // drop route groups
    routes.push('/' + urlSegments.join('/'))
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const name = entry.name
    // Skip api routes, private folders, dynamic segments, and excluded route groups.
    if (name === 'api' || name.startsWith('_') || name.startsWith('[')) continue
    if (EXCLUDED_GROUPS.has(name)) continue
    routes.push(...collectRoutes(join(dir, name), [...segments, name]))
  }

  return routes
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  // Normalize (the root page yields "/", collapse any stray slashes), dedupe,
  // and drop private/admin/internal routes.
  const paths = Array.from(
    new Set(collectRoutes(APP_DIR).map((p) => (p === '/' ? '/' : p.replace(/\/+$/, '')))),
  )
    .filter((p) => !isExcluded(p))
    .sort()

  const staticEntries: MetadataRoute.Sitemap = paths.map((path) => {
    if (path === '/') {
      return {
        url: BASE_URL,
        lastModified,
        changeFrequency: 'weekly',
        priority: 1,
      }
    }
    return {
      url: `${BASE_URL}${path}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    }
  })

  // Dynamic [slug] routes can't be discovered by the directory walk above, so
  // enumerate them from their source of truth: the feature catalog and the
  // blog content folder.
  const featureEntries: MetadataRoute.Sitemap = FEATURES.map((f) => ({
    url: `${BASE_URL}/features/${f.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const blogEntries: MetadataRoute.Sitemap = getPostSlugs().map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...featureEntries, ...blogEntries]
}
