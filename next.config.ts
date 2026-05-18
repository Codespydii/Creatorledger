import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  // @react-pdf/renderer ships native-ish bindings (fontkit, pdfkit) that
  // Vercel's serverless bundler can't tree-shake correctly. Keeping it
  // external means Node loads it normally at runtime instead of bundling.
  serverExternalPackages: ['@react-pdf/renderer'],
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
