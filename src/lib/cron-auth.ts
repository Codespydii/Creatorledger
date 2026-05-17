import 'server-only'
import { timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

export function verifyCronAuth(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected || expected.length === 0) return false

  const auth = req.headers.get('authorization') ?? ''
  const prefix = 'Bearer '
  if (!auth.startsWith(prefix)) return false

  const provided = auth.slice(prefix.length)
  const a = Buffer.from(provided, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
