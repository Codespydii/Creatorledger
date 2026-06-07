/* eslint-disable no-console */
import { config } from 'dotenv'
import { Redis } from '@upstash/redis'
import { Resend } from 'resend'

config({ path: '.env.local' })

const results: Array<{ name: string; ok: boolean; detail: string }> = []
const check = (name: string, ok: boolean, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
}

async function main() {
  console.log('\n══ Service connectivity check ══\n')

  // ── Upstash ──
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    check('Upstash Redis', false, 'env vars missing')
  } else {
    try {
      const redis = Redis.fromEnv()
      const key = `verify-${Date.now()}`
      await redis.set(key, 'ok', { ex: 30 })
      const v = await redis.get(key)
      await redis.del(key)
      check('Upstash Redis ping', v === 'ok', `roundtrip: set/get/del`)
    } catch (e) {
      check('Upstash Redis ping', false, (e as Error).message)
    }
  }

  // ── Resend ──
  if (!process.env.RESEND_API_KEY) {
    check('Resend', false, 'RESEND_API_KEY missing')
  } else {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      // Send a real test email to Resend's universal-success address.
      // No quota burn; this address auto-succeeds.
      const r = await resend.emails.send({
        from: `Caelo <${process.env.RESEND_FROM_EMAIL ?? 'noreply@usecaelo.com'}>`,
        to: 'delivered@resend.dev',
        subject: 'Connectivity test — Caelo',
        html: '<p>This is a Resend connectivity test from Caelo setup.</p>',
      })
      if (r.error) {
        check('Resend send to delivered@resend.dev', false, JSON.stringify(r.error))
      } else {
        check('Resend send to delivered@resend.dev', true, `id: ${r.data?.id}`)
      }
    } catch (e) {
      check('Resend send to delivered@resend.dev', false, (e as Error).message)
    }
  }

  // ── Sentry ──
  // Send a real test event via the ingest envelope API. Confirms DSN auth works
  // and the project is reachable. The event will show up in Sentry as an info message.
  if (!process.env.SENTRY_DSN) {
    check('Sentry DSN', false, 'SENTRY_DSN missing')
  } else {
    try {
      const dsn = new URL(process.env.SENTRY_DSN)
      const projectId = dsn.pathname.replace('/', '')
      const publicKey = dsn.username

      const eventId = crypto.randomUUID().replace(/-/g, '')
      const timestamp = new Date().toISOString()
      const envelopeHeader = JSON.stringify({ event_id: eventId, dsn: process.env.SENTRY_DSN, sent_at: timestamp })
      const itemHeader = JSON.stringify({ type: 'event' })
      const event = JSON.stringify({
        event_id: eventId,
        timestamp,
        platform: 'node',
        level: 'info',
        message: { formatted: 'Caelo setup verification (safe to ignore)' },
        environment: 'setup-test',
        tags: { source: 'verify-services-script' },
      })
      const body = `${envelopeHeader}\n${itemHeader}\n${event}\n`

      const r = await fetch(`https://${dsn.host}/api/${projectId}/envelope/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-sentry-envelope',
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${publicKey}, sentry_client=cl-setup/1.0`,
        },
        body,
      })

      check(
        'Sentry event ingested',
        r.status === 200,
        `status: ${r.status} — event will appear in your Sentry dashboard`,
      )
    } catch (e) {
      check('Sentry event ingest', false, (e as Error).message)
    }
  }

  console.log('')
  const fails = results.filter(r => !r.ok)
  console.log(`${results.length - fails.length}/${results.length} services OK`)
  if (fails.length) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
