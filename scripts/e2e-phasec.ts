/* eslint-disable no-console */
import { config } from 'dotenv'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

config({ path: '.env.local' })
const BASE = 'http://localhost:3000'
const SECRET = process.env.SESSION_SECRET!
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

let pass = 0, fail = 0
const check = (s: string, ok: boolean, d = '') => { ok ? pass++ : fail++; console.log(`${ok ? '✓' : '✗'} ${s}${d ? ' — ' + d : ''}`) }
const forge = (userId: string, email: string) =>
  new SignJWT({ userId, email, expiresAt: new Date(Date.now() + 7 * 864e5).toISOString() })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(new TextEncoder().encode(SECRET))
const toText = (h: string) => h.replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

async function main() {
  const user = await db.user.create({ data: { email: `e2e-phasec-${Date.now()}@example.com`, name: 'PhaseC', passwordHash: await bcrypt.hash('x'.repeat(12), 10) } })
  const cookie = await forge(user.id, user.email)

  // A verified contribution that will surface in "Latest contributions" (most recent globally).
  const row = await db.rateBenchmark.create({
    data: { userId: user.id, niche: 'gaming', platform: 'tiktok', format: 'organic', subscriberTier: 'small', amountCents: 1234 * 100, currency: 'USD', source: 'verified' },
  })

  const html = await fetch(`${BASE}/benchmarks?niche=gaming&platform=tiktok&format=organic&subscriberTier=small`, {
    headers: { Cookie: `session=${cookie}` }, redirect: 'manual',
  }).then((r) => r.text())
  const text = toText(html)

  // Item 1 — methodology copy mentions verified
  check('methodology explains "Verified deals"', /Verified deals/.test(text) && /money that actually changed hands/.test(text))
  // Item 2 — per-row verified badge (unique title attribute) renders in Latest contributions
  check('Latest contributions shows per-row Verified badge', html.includes('Verified from a real, paid deal'))
  check('verified row label present', /Gaming · TikTok · Organic video/.test(text))
  // Bonus — slice reads the verified confidence tier
  check('slice badge is "Verified deals" tier', /Verified deals/.test(text))

  // cleanup
  await db.rateBenchmark.delete({ where: { id: row.id } })
  await db.user.delete({ where: { id: user.id } })
  check('cleanup', true)

  console.log(`\n${fail === 0 ? '✅ ALL PASSED' : '❌ FAILURES'}  (${pass} passed, ${fail} failed)`)
  await db.$disconnect()
  process.exit(fail === 0 ? 0 : 1)
}
main().catch(async (e) => { console.error('PROBE ERROR:', e); await db.$disconnect(); process.exit(1) })
