import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  // Let `.md`/`.mdx` files participate as pages and be importable as
  // components. Blog posts live in src/content/blog/*.mdx and are imported
  // dynamically by the [slug] route.
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

  // @react-pdf/renderer ships native-ish bindings (fontkit, pdfkit) that
  // Vercel's serverless bundler can't tree-shake correctly. Keeping it
  // external means Node loads it normally at runtime instead of bundling.
  // mammoth (.docx → text) uses dynamic requires and Node-only deps that the
  // bundler mishandles; keep it external so Node loads it at runtime.
  serverExternalPackages: ['@react-pdf/renderer', 'mammoth'],

  experimental: {
    // Reuse prefetched/visited page segments in the client router cache instead
    // of refetching on every navigation. `dynamic` defaults to 0 (no reuse),
    // which made the cross-page guided tour refetch each page's data on every
    // "Next". Caching dynamic segments for a few minutes lets the tour's
    // prefetch-on-open hold each page's payload so Next lands instantly. The
    // app isn't real-time, and server actions still revalidate after mutations.
    staleTimes: {
      dynamic: 180,
      static: 300,
    },
  },

  async headers() {
    // Baseline security headers applied to every route. (CSP intentionally
    // omitted for now — it needs per-page testing to avoid breaking Recharts,
    // inline styles, and third-party embeds.)
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ]
  },
}

// Compile MDX (no custom remark/rehype plugins — Turbopack can't receive
// non-serializable plugin functions, and the styling is handled in
// src/mdx-components.tsx instead).
const withMDX = createMDX({})
const mdxConfig = withMDX(nextConfig)

// Only wrap with Sentry when a DSN is set; otherwise export the bare config.
const config = process.env.SENTRY_DSN
  ? withSentryConfig(mdxConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      errorHandler: () => {},
      widenClientFileUpload: true,
      // disableLogger was deprecated; the replacement (webpack.treeshake.removeDebugLogging)
      // is not supported with Turbopack. Sentry's build-time logger output is harmless.
    })
  : mdxConfig

export default config
