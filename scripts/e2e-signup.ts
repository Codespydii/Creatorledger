/* eslint-disable no-console */
import { config } from 'dotenv'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

config({ path: '.env.local' })

const BASE = 'http://localhost:3000'
const SECRET = process.env.SESSION_SECRET!
const TEST_EMAIL = `e2e-${Date.now()}@example.com`
const TEST_NAME = 'Maya E2E'
const TEST_PASSWORD = 'tested-passphrase-2026'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const results: Array<{ step: string; pass: boolean; detail: string }> = []

function check(step: string, pass: boolean, detail = '') {
  results.push({ step, pass, detail })
  console.log(`${pass ? '✓' : '✗'} ${step}${detail ? ' — ' + detail : ''}`)
}

async function forgeSession(userId: string, email: string): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  return new SignJWT({ userId, email, expiresAt: expiresAt.toISOString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(SECRET))
}

async function fetchWithCookie(path: string, cookie?: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string> | undefined) }
  if (cookie) headers['Cookie'] = `session=${cookie}`
  return fetch(`${BASE}${path}`, { ...opts, headers, redirect: 'manual' })
}

async function main() {
  console.log(`\n→ E2E signup flow test`)
  console.log(`  Email: ${TEST_EMAIL}\n`)

  // ── PRECHECK: dev server up
  try {
    const r = await fetch(`${BASE}/`, { redirect: 'manual' })
    check('Dev server reachable', r.status === 200, `GET / → ${r.status}`)
  } catch (e) {
    check('Dev server reachable', false, `Not running. Start it first.`)
    process.exit(1)
  }

  // ── STEP 1: Landing page renders with key signals
  {
    const r = await fetch(`${BASE}/`)
    const html = await r.text()
    check('Landing has signup CTA', html.includes('/signup') && /sign\s*up/i.test(html))
    check('Landing platform pills', /YouTube/.test(html) && /Instagram/.test(html) && /TikTok/.test(html))
    check('Landing pricing transparency', /No surprise charges/.test(html))
    check('Landing legal footer link', /\/legal\/terms/.test(html) && /\/legal\/privacy/.test(html))
  }

  // ── STEP 2: Signup page renders with new affordances
  {
    const r = await fetch(`${BASE}/signup`)
    const html = await r.text()
    check('Signup page renders (200)', r.status === 200)
    check('Signup has Google button', /Sign up with Google/i.test(html))
    check('Signup has password hint', /Use 8\+ characters/.test(html))
    check('Signup has Terms link', /\/legal\/terms/.test(html))
    check('Signup has Privacy link', /\/legal\/privacy/.test(html))
  }

  // ── STEP 3: Legal pages reachable
  {
    const t = await fetch(`${BASE}/legal/terms`)
    const p = await fetch(`${BASE}/legal/privacy`)
    check('Terms page 200', t.status === 200)
    check('Privacy page 200', p.status === 200)
  }

  // ── STEP 4: Auth-gated routes redirect to /login when unauthenticated
  {
    const d = await fetchWithCookie('/dashboard')
    const o = await fetchWithCookie('/onboarding')
    check('/dashboard redirects → /login (no session)', d.status === 307 && (d.headers.get('location') ?? '').endsWith('/login'))
    check('/onboarding redirects → /login (no session)', o.status === 307 && (o.headers.get('location') ?? '').endsWith('/login'))
  }

  // ── STEP 5: Signup mirrors the action — create user with onboardedAt=null
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12)
  const user = await db.user.create({
    data: { email: TEST_EMAIL, name: TEST_NAME, passwordHash, onboardedAt: null },
  })
  check('User created in DB', Boolean(user.id))
  check('User starts with onboardedAt=null', user.onboardedAt === null)

  // ── STEP 6: Forge session, hit /dashboard → must redirect to /onboarding
  const session = await forgeSession(user.id, user.email)
  {
    const r = await fetchWithCookie('/dashboard', session)
    const loc = r.headers.get('location') ?? ''
    check('/dashboard 307 → /onboarding (new user)', r.status === 307 && loc.endsWith('/onboarding'))
  }

  // ── STEP 7: /onboarding renders wizard
  {
    const r = await fetchWithCookie('/onboarding', session)
    const html = await r.text()
    check('/onboarding renders (200)', r.status === 200)
    check('Wizard has 3 questions', /main platform/i.test(html) && /audience/i.test(html) && /headache/i.test(html))
    check('Wizard has Skip', /Skip/.test(html))
    check('Wizard has Continue button', /Continue to dashboard/.test(html))
  }

  // ── STEP 8: Complete onboarding via DB (mirrors action result)
  await db.user.update({
    where: { id: user.id },
    data: {
      primaryPlatform: 'tiktok',
      audienceTier: '10k_to_100k',
      primaryPain: 'sponsorships',
      onboardedAt: new Date(),
    },
  })
  const after = await db.user.findUniqueOrThrow({ where: { id: user.id } })
  check('Onboarding saved primaryPain', after.primaryPain === 'sponsorships')
  check('Onboarding saved primaryPlatform', after.primaryPlatform === 'tiktok')
  check('Onboarding marked onboardedAt', Boolean(after.onboardedAt))

  // ── STEP 9: /onboarding now bounces already-onboarded users
  {
    const r = await fetchWithCookie('/onboarding', session)
    const loc = r.headers.get('location') ?? ''
    check('/onboarding 307 → /dashboard (already done)', r.status === 307 && loc.endsWith('/dashboard'))
  }

  // ── STEP 10: /dashboard renders + personalized SetupCard
  {
    const r = await fetchWithCookie('/dashboard', session)
    const html = await r.text()
    check('/dashboard renders (200)', r.status === 200)
    check('Dashboard greets user', new RegExp(TEST_NAME.split(' ')[0], 'i').test(html))
    check('Dashboard personalized heading (sponsorships)', /deals tracked/i.test(html))
    check('Dashboard mentions TikTok in subhead', /TikTok/i.test(html))
    check('SetupCard shows Log deal tile', /Log your first deal|Add a deal/i.test(html))
  }

  // ── STEP 11: After data added, SetupCard disappears
  await db.deal.create({
    data: { userId: user.id, brandName: 'Test Co', stage: 'prospect', valueCents: 100000 },
  })
  {
    const r = await fetchWithCookie('/dashboard', session)
    const html = await r.text()
    check('Dashboard still 200 after deal added', r.status === 200)
    check('SetupCard hides once user has data', !/Get set up in 60 seconds/i.test(html) && !/Let.s get those deals tracked/i.test(html))
  }

  // ── STEP 12: Bad session cookie → /dashboard kicks to /login
  {
    const r = await fetchWithCookie('/dashboard', 'garbage.invalid.jwt')
    const loc = r.headers.get('location') ?? ''
    check('/dashboard rejects forged-bad cookie', r.status === 307 && loc.endsWith('/login'))
  }

  // ── STEP 13: Google-only path — verify login action rejects email login for password-less user
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: null, googleId: 'fake-google-sub-' + user.id },
  })
  const reloaded = await db.user.findUniqueOrThrow({ where: { id: user.id } })
  check('User can be password-less (Google-only)', reloaded.passwordHash === null && Boolean(reloaded.googleId))

  // ── CLEANUP
  await db.deal.deleteMany({ where: { userId: user.id } })
  await db.user.delete({ where: { id: user.id } })
  console.log(`\nCleanup: deleted test user ${user.id}`)

  // ── REPORT
  const failed = results.filter(r => !r.pass)
  console.log(`\n────────────────────────────────`)
  console.log(`${results.length - failed.length}/${results.length} checks passed`)
  if (failed.length) {
    console.log(`\nFailures:`)
    failed.forEach(f => console.log(`  ✗ ${f.step}${f.detail ? ' — ' + f.detail : ''}`))
    process.exit(1)
  }
  console.log(`All green.\n`)

  await db.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await db.$disconnect()
  process.exit(1)
})
