import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  // Add real config here as needed.
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
      disableLogger: true,
    })
  : nextConfig

export default config
