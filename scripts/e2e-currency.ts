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

const EMAIL = `currency-test-${Date.now()}@example.com`
const NAME = 'Currency Tester'
const PASSWORD = 'Test@1234'

const results: Array<{ check: string; pass: boolean; detail: string }> = []
const check = (c: string, p: boolean, d = '') => {
  results.push({ check: c, pass: p, detail: d })
  console.log(`${p ? '✓' : '✗'} ${c}${d ? ' — ' + d : ''}`)
}

async function forgeSession(userId: string, email: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  return new SignJWT({ userId, email, expiresAt: expiresAt.toISOString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(SECRET))
}

async function get(path: string, cookie: string) {
  return fetch(`${BASE}${path}`, { headers: { Cookie: `session=${cookie}` }, redirect: 'manual' })
}

async function main() {
  console.log(`\n══ CURRENCY E2E ══  ${EMAIL}\n`)

  await db.user.deleteMany({ where: { email: EMAIL } })
  const hash = await bcrypt.hash(PASSWORD, 12)
  const user = await db.user.create({
    data: {
      email: EMAIL, name: NAME, passwordHash: hash,
      onboardedAt: new Date(),
      primaryPlatform: 'youtube',
      audienceTier: '10k_to_100k',
      primaryPain: 'sponsorships',
      defaultCurrency: 'USD',
    },
  })
  const session = await forgeSession(user.id, user.email)

  // Seed some data so the dashboard renders KPIs (otherwise SetupCard hides $)
  await db.revenueEntry.create({
    data: { user: { connect: { id: user.id } }, source: 'adsense', amountCents: 1200000, currency: 'USD', description: 'Test', date: new Date() },
  })

  // ── STAGE 1: USD default — dashboard shows $
  {
    const r = await get('/dashboard', session)
    const html = await r.text()
    check('USD: dashboard renders 200', r.status === 200)
    check('USD: shows $ symbol', /\$[\d,]+/.test(html))
    check('USD: no ₹ symbol present', !/₹/.test(html))
  }

  // ── STAGE 2: Settings page shows the currency dropdown
  {
    const r = await get('/settings', session)
    const html = await r.text()
    check('Settings: shows "Display currency" label', /Display currency/i.test(html))
    check('Settings: USD option present', /US Dollar/i.test(html))
    check('Settings: INR option present', /Indian Rupee/i.test(html))
    check('Settings: GBP option present', /British Pound/i.test(html))
  }

  // ── STAGE 3: Switch to INR
  await db.user.update({ where: { id: user.id }, data: { defaultCurrency: 'INR' } })

  // ── STAGE 4: Dashboard now renders ₹
  {
    const r = await get('/dashboard', session)
    const html = await r.text()
    check('INR: dashboard renders 200', r.status === 200)
    check('INR: shows ₹ symbol', /₹[\d,]+/.test(html))
  }

  // ── STAGE 5: Revenue page renders ₹
  {
    const r = await get('/revenue', session)
    const html = await r.text()
    check('INR: /revenue renders 200', r.status === 200)
    check('INR: /revenue shows ₹', /₹/.test(html))
  }

  // ── STAGE 6: Other pages — quick currency probe
  for (const path of ['/expenses', '/invoices', '/deals', '/forecast', '/reports', '/benchmarks']) {
    const r = await get(path, session)
    const html = await r.text()
    const has200 = r.status === 200
    check(`INR: ${path} renders 200`, has200)
    if (has200) {
      // Strip <script> tags (RSC payload references like $5, $10 live there) and check visible HTML
      const visible = html.replace(/<script[\s\S]*?<\/script>/g, '')
      // Real money would be $1,000 or $1.50 — at least one separator
      const hasDollarAmount = /\$\d[\d,]*\.?\d*/.test(visible) && /\$[\d,]{2,}/.test(visible)
      check(`INR: ${path} has no stray $ amounts`, !hasDollarAmount)
    }
  }

  // ── STAGE 7: Invoice print page in INR
  const invoice = await db.invoice.create({
    data: {
      user: { connect: { id: user.id } },
      invoiceNumber: `CUR-${Date.now()}`,
      clientName: 'Test Client',
      clientEmail: 'client@example.com',
      issuedDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotalCents: 2500000,
      taxCents: 0,
      totalCents: 2500000,
      status: 'draft',
      items: { create: [{ description: 'Test line', quantity: 1, unitPriceCents: 2500000, totalCents: 2500000 }] },
    },
  })
  {
    const r = await get(`/invoices/${invoice.id}`, session)
    const html = await r.text()
    check('INR: invoice print page renders 200', r.status === 200)
    check('INR: invoice print page shows ₹', /₹/.test(html))
  }

  // ── STAGE 8: Switch back to USD — dashboard reverts
  await db.user.update({ where: { id: user.id }, data: { defaultCurrency: 'USD' } })
  {
    const r = await get('/dashboard', session)
    const html = await r.text()
    check('Revert: dashboard renders $ again', /\$[\d,]+/.test(html) && !/₹[\d,]+/.test(html))
  }

  // Cleanup
  await db.invoiceLineItem.deleteMany({ where: { invoice: { userId: user.id } } })
  await db.invoice.deleteMany({ where: { userId: user.id } })
  await db.revenueEntry.deleteMany({ where: { userId: user.id } })
  await db.user.delete({ where: { id: user.id } })
  console.log(`\nCleanup: user ${user.id} removed.`)

  const fails = results.filter(r => !r.pass)
  console.log(`\n${'─'.repeat(40)}`)
  console.log(`${results.length - fails.length}/${results.length} checks passed`)
  if (fails.length) {
    console.log(`\nFailures:`)
    fails.forEach(f => console.log(`  ✗ ${f.check}${f.detail ? ' — ' + f.detail : ''}`))
    process.exit(1)
  }
  console.log(`All green.\n`)

  await db.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
