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
  const user = await db.user.create({
    data: {
      email: `e2e-phaseb-${Date.now()}@example.com`, name: 'PhaseB E2E',
      passwordHash: await bcrypt.hash('x'.repeat(12), 10),
      primaryPlatform: 'youtube', audienceTier: '1m_plus', niche: 'tech',
    },
  })
  const cookie = await forge(user.id, user.email)
  console.log(`user ${user.id}\n`)

  const mkDeal = async (brand: string, opts: { currency?: string; withRevenue?: boolean } = {}) => {
    const deal = await db.deal.create({
      data: { userId: user.id, brandName: brand, stage: 'completed', currency: opts.currency ?? 'USD', valueCents: 4200 * 100, closedAt: new Date() },
    })
    if (opts.withRevenue ?? true) {
      await db.revenueEntry.create({ data: { userId: user.id, dealId: deal.id, source: 'sponsorship', amountCents: 4200 * 100, description: 'pay', date: new Date() } })
    }
    return deal
  }

  const eligible = await mkDeal('EligibleBrandZ')
  const noRev = await mkDeal('UnpaidBrandZ', { withRevenue: false })
  const gbp = await mkDeal('PoundsBrandZ', { currency: 'GBP' })
  const contributed = await mkDeal('ContributedBrandZ')
  await db.rateBenchmark.create({
    data: { userId: user.id, dealId: contributed.id, niche: 'tech', platform: 'youtube', format: 'integrated', subscriberTier: 'mega', amountCents: 4200 * 100, currency: 'USD', source: 'verified' },
  })

  // /deals renders cleanly with all deal states (new include + mapping + components)
  const deals = await fetch(`${BASE}/deals`, { headers: { Cookie: `session=${cookie}` }, redirect: 'manual' })
  const dealsHtml = await deals.text()
  const dealsText = toText(dealsHtml)
  check('GET /deals → 200', deals.status === 200, `status ${deals.status}`)
  check('no server error on /deals', !/Application error|Internal Server Error|Unhandled/i.test(dealsText))
  for (const b of ['EligibleBrandZ', 'UnpaidBrandZ', 'PoundsBrandZ', 'ContributedBrandZ']) {
    check(`board renders deal "${b}"`, dealsText.includes(b))
  }

  // /settings renders the new niche field with the saved value
  const settings = await fetch(`${BASE}/settings`, { headers: { Cookie: `session=${cookie}` }, redirect: 'manual' })
  const settingsHtml = await settings.text()
  check('GET /settings → 200', settings.status === 200, `status ${settings.status}`)
  check('settings shows "Content niche" field', /Content niche/.test(toText(settingsHtml)))
  check('niche "tech" pre-selected', /<option[^>]*value="tech"[^>]*selected/i.test(settingsHtml) || /selected[^>]*value="tech"/i.test(settingsHtml))

  // cleanup
  await db.rateBenchmark.deleteMany({ where: { userId: user.id } })
  await db.revenueEntry.deleteMany({ where: { userId: user.id } })
  await db.deal.deleteMany({ where: { userId: user.id } })
  await db.user.delete({ where: { id: user.id } })
  check('cleanup', true)
  void [eligible, noRev, gbp]

  console.log(`\n${fail === 0 ? '✅ ALL PASSED' : '❌ FAILURES'}  (${pass} passed, ${fail} failed)`)
  await db.$disconnect()
  process.exit(fail === 0 ? 0 : 1)
}
main().catch(async (e) => { console.error('PROBE ERROR:', e); await db.$disconnect(); process.exit(1) })
