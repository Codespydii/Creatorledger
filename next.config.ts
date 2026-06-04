import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  // @react-pdf/renderer ships native-ish bindings (fontkit, pdfkit) that
  // Vercel's serverless bundler can't tree-shake correctly. Keeping it
  // external means Node loads it normally at runtime instead of bundling.
  // mammoth (.docx → text) uses dynamic requires and Node-only deps that the
  // bundler mishandles; keep it external so Node loads it at runtime.
  serverExternalPackages: ['@react-pdf/renderer', 'mammoth'],

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

// Only wrap with Sentry when a DSN is set; otherwise export the bare config.
const config = process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      errorHandler: () => {},
      widenClientFileUpload: true,
      // disableLogger was deprecated; the replacement (webpack.treeshake.removeDebugLogging)
      // is not supported with Turbopack. Sentry's build-time logger output is harmless.
    })
  : nextConfig

export default config
