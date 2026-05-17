import { NextRequest, NextResponse } from 'next/server'

/**
 * TEMPORARY DEBUG ROUTE — delete after fixing the DATABASE_URL issue.
 * Returns the structure of DATABASE_URL (no secrets) plus the result of a
 * single connection attempt. Protected by CRON_SECRET so it's not public.
 *
 * Usage:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/debug/db
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const raw = process.env.DATABASE_URL ?? ''
  let parsed: Record<string, unknown> = { raw_length: raw.length }

  try {
    const url = new URL(raw)
    parsed = {
      raw_length: raw.length,
      protocol: url.protocol,
      username: url.username,                       // includes project ref if pooler
      password_length: url.password.length,         // never the value itself
      password_first_char: url.password[0] ?? null,
      password_last_char: url.password[url.password.length - 1] ?? null,
      password_has_percent: url.password.includes('%'),
      password_has_amp: url.password.includes('&'),
      password_has_hash: url.password.includes('#'),
      host: url.host,
      port: url.port,
      pathname: url.pathname,
      // Reconstruct without password to confirm format
      sanitized: `${url.protocol}//${url.username}:[REDACTED]@${url.host}${url.pathname}`,
    }
  } catch (e) {
    parsed.url_parse_error = e instanceof Error ? e.message : String(e)
  }

  // Try a real query
  let connectionResult: Record<string, unknown> = { tried: false }
  try {
    const { PrismaClient } = await import('@/generated/prisma/client')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const adapter = new PrismaPg({ connectionString: raw })
    const db = new PrismaClient({ adapter })
    const count = await db.user.count()
    await db.$disconnect()
    connectionResult = { tried: true, ok: true, user_count: count }
  } catch (e) {
    connectionResult = {
      tried: true,
      ok: false,
      error: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
    }
  }

  return NextResponse.json({ url: parsed, connection: connectionResult })
}
