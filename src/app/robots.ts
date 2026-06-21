import type { MetadataRoute } from 'next'

const BASE_URL = 'https://usecaelo.com'

// Served at /robots.txt. Allow crawling of all public marketing pages, block the
// authenticated app, auth flows, API routes, admin, and internal print routes
// (these are already excluded from the sitemap; this is the crawler-facing
// counterpart). The sitemap reference is the important bit — it's how Google and
// Bing discover /sitemap.xml without a manual GSC submission.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/onboarding',
          '/verify-email',
          '/settings',
          '/spiral', // admin
          '/report-pdf', // internal PDF render route
          '/i/', // public invoices (already noindex)
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
