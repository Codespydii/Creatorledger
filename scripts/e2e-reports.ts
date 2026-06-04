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

const IN = new Date('2026-02-15T12:00:00')   // inside the custom range
const OUT = new Date('2025-11-15T12:00:00')  // outside it
const Q = 'period=custom&from=2026-02-01&to=2026-02-28'

async function main() {
  const user = await db.user.create({ data: { email: `e2e-rpt-${Date.now()}@example.com`, name: 'Rpt', passwordHash: await bcrypt.hash('x'.repeat(12), 10) } })
  const cookie = await forge(user.id, user.email)
  const n = Date.now()

  await db.revenueEntry.createMany({ data: [
    { userId: user.id, source: 'sponsorship', amountCents: 100000, description: 'in-range rev', date: IN },
    { userId: user.id, source: 'adsense', amountCents: 999900, description: 'out-range rev', date: OUT },
  ]})
  await db.expense.createMany({ data: [
    { userId: user.id, category: 'software', amountCents: 20000, description: 'in-range exp', date: IN },
    { userId: user.id, category: 'gear', amountCents: 500000, description: 'out-range exp', date: OUT },
  ]})
  await db.invoice.create({ data: { userId: user.id, invoiceNumber: `INV-${n}-A`, clientName: 'C', clientEmail: 'c@x.com', status: 'paid', subtotalCents: 50000, totalCents: 50000, dueDate: IN, createdAt: IN } })
  await db.invoice.create({ data: { userId: user.id, invoiceNumber: `INV-${n}-B`, clientName: 'C', clientEmail: 'c@x.com', status: 'paid', subtotalCents: 777700, totalCents: 777700, dueDate: OUT, createdAt: OUT } })
  await db.deal.create({ data: { userId: user.id, brandName: 'InRangeDeal', stage: 'negotiation', valueCents: 300000, createdAt: IN } })
  await db.deal.create({ data: { userId: user.id, brandName: 'OutRangeDeal', stage: 'prospect', valueCents: 888800, createdAt: OUT } })

  const get = (path: string) => fetch(`${BASE}${path}`, { headers: { Cookie: `session=${cookie}` }, redirect: 'manual' })

  // --- Reports page: range-scoped ---
  const rep = await get(`/reports?${Q}`)
  const repHtml = await rep.text()
  check('GET /reports → 200', rep.status === 200, `status ${rep.status}`)
  check('reports includes in-range revenue $1,000', repHtml.includes('$1,000'))
  check('reports EXCLUDES out-of-range $9,999', !repHtml.includes('$9,999'))

  // --- PDF print view ---
  const pdf = await get(`/report-pdf?${Q}`)
  const html = await pdf.text()
  check('GET /report-pdf → 200', pdf.status === 200, `status ${pdf.status}`)
  check('has "Financial Report" title', /Financial Report/.test(html))
  check('shows the date range (2026)', /2026/.test(html))
  check('Caelo logo + icon present', html.includes('/caelo-icon.png') && html.includes('/caelo-logo.png'))
  check('"Save as PDF" button + "Powered by"', /Save as PDF/.test(html) && /Powered by/.test(html))
  check('charts present (Revenue vs Expenses + Revenue by Source)', /Revenue vs Expenses/.test(html) && /Revenue by Source/.test(html))
  check('chrome-free (no dashboard topbar subtitle)', !html.includes('Financial insights for your creator business'))

  // Date-range correctness across every section
  check('PDF revenue = $1,000 (in-range only)', html.includes('$1,000') && !html.includes('$9,999'))
  check('PDF expenses = $200 (excludes $5,000)', html.includes('$200') && !html.includes('$5,000'))
  check('PDF net profit = $800', html.includes('$800'))
  check('PDF invoice paid = $500 (excludes $7,777)', html.includes('$500') && !html.includes('$7,777'))
  check('PDF pipeline = $3,000 (excludes $8,888)', html.includes('$3,000') && !html.includes('$8,888'))

  // cleanup
  await db.revenueEntry.deleteMany({ where: { userId: user.id } })
  await db.expense.deleteMany({ where: { userId: user.id } })
  await db.invoice.deleteMany({ where: { userId: user.id } })
  await db.deal.deleteMany({ where: { userId: user.id } })
  await db.user.delete({ where: { id: user.id } })
  check('cleanup', true)

  console.log(`\n${fail === 0 ? '✅ ALL PASSED' : '❌ FAILURES'}  (${pass} passed, ${fail} failed)`)
  await db.$disconnect()
  process.exit(fail === 0 ? 0 : 1)
}
main().catch(async (e) => { console.error('PROBE ERROR:', e); await db.$disconnect(); process.exit(1) })
