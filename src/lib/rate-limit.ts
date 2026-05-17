import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'

/**
 * Rate limiting with graceful degradation.
 *
 * If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set, uses real
 * Upstash Redis (works on Vercel serverless across regions).
 *
 * If not set, falls back to a process-local in-memory limiter — which is
 * fine for local dev but PROVIDES NO PROTECTION on Vercel (each lambda
 * invocation has its own memory). The console warns loudly so it's not
 * shipped to prod by accident.
 */

const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
)

if (!isUpstashConfigured && process.env.NODE_ENV === 'production') {
  console.warn(
    '[rate-limit] WARNING: Upstash Redis is not configured. ' +
    'Rate limiting is using in-memory fallback which does NOT work in serverless. ' +
    'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN before going to prod.',
  )
}

const redis = isUpstashConfigured ? Redis.fromEnv() : null

// In-memory fallback — bucketed by key, simple counter with reset
type Bucket = { count: number; resetAt: number }
const memoryBuckets = new Map<string, Bucket>()

function memoryLimit(key: string, limit: number, windowMs: number): { success: boolean; remaining: number; reset: number } {
  const now = Date.now()
  const bucket = memoryBuckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, reset: now + windowMs }
  }
  bucket.count++
  return { success: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count), reset: bucket.resetAt }
}

const limiters: Record<string, Ratelimit | null> = {}

function getRealLimiter(name: string, limit: number, windowSec: number): Ratelimit | null {
  if (!redis) return null
  if (!limiters[name]) {
    limiters[name] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: `cl:${name}`,
    })
  }
  return limiters[name]
}

export interface RateLimitConfig {
  name: string       // bucket name (e.g. "signup", "login", "ai")
  limit: number      // max requests
  windowSec: number  // window in seconds
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number    // unix ms
}

/**
 * Identify the client. Uses real IP from common forward headers, falls back
 * to a generic key. Pass a stable `extra` (e.g. email) to scope per-account.
 */
async function getClientKey(extra?: string): Promise<string> {
  const h = await headers()
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    h.get('cf-connecting-ip') ||
    'unknown'
  return extra ? `${ip}:${extra}` : ip
}

export async function rateLimit(
  config: RateLimitConfig,
  extra?: string,
): Promise<RateLimitResult> {
  const key = `${config.name}:${await getClientKey(extra)}`

  const real = getRealLimiter(config.name, config.limit, config.windowSec)
  if (real) {
    const { success, remaining, reset } = await real.limit(key)
    return { ok: success, remaining, resetAt: reset }
  }

  // Fallback — in-memory
  const { success, remaining, reset } = memoryLimit(key, config.limit, config.windowSec * 1000)
  return { ok: success, remaining, resetAt: reset }
}

// Pre-configured buckets for common use cases
export const LIMITS = {
  signup:        { name: 'signup',   limit: 5,  windowSec: 60 * 60 }, // 5 per hour per IP
  login:         { name: 'login',    limit: 10, windowSec: 15 * 60 }, // 10 per 15 min per IP+email
  forgotPwd:     { name: 'forgot',   limit: 3,  windowSec: 60 * 60 }, // 3 per hour per IP+email
  passwordReset: { name: 'reset',    limit: 5,  windowSec: 15 * 60 }, // 5 per 15 min per IP
  ai:            { name: 'ai',       limit: 30, windowSec: 60 * 60 }, // 30 per hour per user
  resendVerify:  { name: 'resend',   limit: 3,  windowSec: 60 * 60 }, // 3 per hour per user
} as const

export function rateLimitErrorMessage(result: RateLimitResult): string {
  const secs = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
  if (secs < 60) return `Too many attempts. Try again in ${secs} seconds.`
  const mins = Math.ceil(secs / 60)
  if (mins < 60) return `Too many attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`
  const hrs = Math.ceil(mins / 60)
  return `Too many attempts. Try again in ${hrs} hour${hrs === 1 ? '' : 's'}.`
}
