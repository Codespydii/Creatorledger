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

async function main() {
  const user = await db.user.create({ data: { email: `e2e-mk-${Date.now()}@example.com`, name: 'MK Tester', passwordHash: await bcrypt.hash('x'.repeat(12), 10) } })
  const cookie = await forge(user.id, user.email)
  const slug = `e2e-mk-${Date.now()}`
  const ACCENT = '#ff5722' // distinctive, clearly not the #7c3aed default

  await db.mediaKit.create({
    data: { userId: user.id, slug, isPublic: true, displayName: 'Color Test Creator', tagline: 'Testing the kit', accentColor: ACCENT, subscriberCount: 12345, sampleWorkUrls: 'https://youtube.com/watch?v=abc123' },
  })

  // Public kit page (no auth needed since published)
  const pubRes = await fetch(`${BASE}/m/${slug}`, { redirect: 'manual' })
  const html = await pubRes.text()
  check('public kit → 200', pubRes.status === 200, `status ${pubRes.status}`)
  check('footer shows Caelo icon image', html.includes('/caelo-icon.png'))
  check('footer shows Caelo logo image', html.includes('/caelo-logo.png'))
  check('footer says "Powered by"', /Powered by/.test(html))
  check('custom accent color applied (not the default)', html.includes(ACCENT) && !html.includes('#7c3aed'), `accent ${ACCENT}`)
  // One-page PDF + rounded card + compact print layout
  check('kit is a rounded card', html.includes('id="mk-article"') && /rounded-2xl/.test(html))
  check('print CSS sets A4 page + fit-to-one-page zoom', /@page/.test(html) && /--mk-zoom/.test(html))
  check('compact print layout hooks present', /mk-hero/.test(html) && /mk-body/.test(html) && /\.mk-pdf/.test(html))
  check('print swaps blank video iframes for link cards', /mk-print-link/.test(html))

  // Dashboard form renders the visual color picker
  const formRes = await fetch(`${BASE}/media-kit`, { headers: { Cookie: `session=${cookie}` }, redirect: 'manual' })
  const formHtml = await formRes.text()
  check('media-kit form → 200', formRes.status === 200, `status ${formRes.status}`)
  check('form renders the react-colorful palette', /react-colorful/.test(formHtml))
  check('hex field reflects saved accent', formHtml.includes(`value="${ACCENT}"`))

  // cleanup
  await db.mediaKit.delete({ where: { userId: user.id } })
  await db.user.delete({ where: { id: user.id } })
  check('cleanup', true)

  console.log(`\n${fail === 0 ? '✅ ALL PASSED' : '❌ FAILURES'}  (${pass} passed, ${fail} failed)`)
  await db.$disconnect()
  process.exit(fail === 0 ? 0 : 1)
}
main().catch(async (e) => { console.error('PROBE ERROR:', e); await db.$disconnect(); process.exit(1) })
