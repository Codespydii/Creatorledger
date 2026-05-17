
// Sentry server-side initialization.
// Only initializes if SENTRY_DSN is set — otherwise this is a silent no-op.
// Loaded automatically by @sentry/nextjs.

import * as Sentry from '@sentry/nextjs'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    // Avoid sending PII unless explicitly configured.
    sendDefaultPii: false,
  })
}
