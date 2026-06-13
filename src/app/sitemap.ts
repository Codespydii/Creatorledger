import type { MetadataRoute } from 'next'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE_URL = 'https://usecaelo.com'

// App Router root for this project (uses the `src/` convention).
const APP_DIR = join(process.cwd(), 'src', 'app')

// Special files that live alongside a route but are not themselves pages.
const NON_PAGE_FILES = new Set(['layout.tsx', 'loading.tsx', 'error.tsx', 'not-found.tsx'])

// Authenticated, admin, and internal routes are excluded from the public
// sitemap: search engines can't crawl login-gated pages (they'd just be
// redirected to /login), and admin/internal pages shouldn't be advertised. A
// route is dropped if it equals or sits under any of these prefixes. The scan
// stays automatic, so new *public* pages are still picked up with no edits.
const PRIVATE_PREFIXES = [
  '/dashboard',
  '/settings',
  '/revenue',
  '/expenses',
  '/deals',
  '/invoices',
  '/forecast',
  '/reports',
  '/media-kit',
  '/contracts',
  '/benchmarks',
  '/spiral',
  '/onboarding',
  '/report-pdf',
]

function isPrivate(path: string): boolean {
  return PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
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
    if (name === 'api' || name.startsWith('_') || name.startsWith('[')) continue
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
    .filter((p) => !isPrivate(p))
    .sort()

  return paths.map((path) => {
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
}
