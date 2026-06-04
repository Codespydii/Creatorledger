/* eslint-disable no-console */
import { config } from 'dotenv'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

config({ path: '.env.local' })

const BASE = 'http://localhost:3000'
const SECRET = process.env.SESSION_SECRET!
const TEST_EMAIL = `e2e-bench-${Date.now()}@example.com`

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

let pass = 0
let fail = 0
function check(step: string, ok: boolean, detail = '') {
  if (ok) pass++; else fail++
  console.log(`${ok ? '✓' : '✗'} ${step}${detail ? ' — ' + detail : ''}`)
}

async function forgeSession(userId: string, email: string): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  return new SignJWT({ userId, email, expiresAt: expiresAt.toISOString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(SECRET))
}

function get(path: string, cookie: string) {
  return fetch(`${BASE}${path}`, { headers: { Cookie: `session=${cookie}` }, redirect: 'manual' })
}

// Server-rendered HTML has React's <!-- --> comment markers between adjacent
// text nodes and tags everywhere. Normalize to plain text before matching.
function toText(html: string): string {
  return html
    .replace(/<!--.*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/\s+/g, ' ')
}

const parseCount = (html: string) => {
  const m = toText(html).match(/Based on ([\d,]+) data points/)
  return m ? Number(m[1].replace(/,/g, '')) : null
}
const parseFromCreators = (html: string) => {
  const m = toText(html).match(/(\d+)\s*from creators/)
  return m ? Number(m[1]) : 0
}

const FILTER = { niche: 'tech', platform: 'youtube', format: 'integrated', subscriberTier: 'mid' }
const Q = `niche=${FILTER.niche}&platform=${FILTER.platform}&format=${FILTER.format}&subscriberTier=${FILTER.subscriberTier}`

async function main() {
  // 1. test user + session
  const user = await db.user.create({
    data: { email: TEST_EMAIL, name: 'Bench E2E', passwordHash: await bcrypt.hash('x'.repeat(12), 10) },
  })
  const cookie = await forgeSession(user.id, user.email)
  console.log(`Test user ${user.id}\n`)

  // 2. unfiltered page renders (proves compile + seed + render after restart)
  const root = await get('/benchmarks', cookie)
  const rootHtml = await root.text()
  check('GET /benchmarks → 200 (auth + compiles)', root.status === 200, `status ${root.status}`)
  check('renders page title', /Rate Benchmarks/.test(rootHtml))
  check('renders "Going rate" stats card', /Going rate/.test(rootHtml))
  check('renders "Contribute a rate" button', /Contribute a rate/.test(rootHtml))
  check('renders "Latest contributions" card', /Latest contributions/.test(rootHtml))
  check('renders "Score an offer" calculator', /Score an offer/.test(rootHtml))
  check('seed data present (count > 0)', (parseCount(rootHtml) ?? 0) > 0, `count=${parseCount(rootHtml)}`)
  // Trust/provenance UI
  check('honest subtitle (modeled from CPMs)', /Modeled from industry CPMs/.test(toText(rootHtml)))
  check('methodology disclosure present', /How these numbers work/.test(toText(rootHtml)))
  check('shows a confidence badge', /Modeled estimate|Emerging data|Community-backed/.test(toText(rootHtml)))

  // 3. invalid session → redirect to /login (auth guard works)
  const noAuth = await fetch(`${BASE}/benchmarks`, { redirect: 'manual' })
  check('no session → redirected (not 200)', noAuth.status === 307 || noAuth.status === 302 || noAuth.status === 308, `status ${noAuth.status}`)

  // 4. baseline for our filter
  const before = await get(`/benchmarks?${Q}`, cookie)
  const beforeHtml = await before.text()
  const countBefore = parseCount(beforeHtml)
  const creatorsBefore = parseFromCreators(beforeHtml)
  check('filtered page 200', before.status === 200)
  check('filter description shown', /Mid|50K/.test(beforeHtml))
  console.log(`   baseline: count=${countBefore} fromCreators=${creatorsBefore}`)

  // 5. insert a contribution exactly as contributeRate would (3500 → 350000 cents, source user)
  const inserted = await db.rateBenchmark.create({
    data: {
      userId: user.id,
      niche: FILTER.niche,
      platform: FILTER.platform,
      format: FILTER.format,
      subscriberTier: FILTER.subscriberTier,
      amountCents: 3500 * 100,
      exclusivity: false,
      source: 'user',
    },
  })

  // 6. filtered page reflects the new contribution
  const after = await get(`/benchmarks?${Q}`, cookie)
  const afterHtml = await after.text()
  const countAfter = parseCount(afterHtml)
  const creatorsAfter = parseFromCreators(afterHtml)
  check('data-point count incremented by 1', countAfter === (countBefore ?? 0) + 1, `${countBefore} → ${countAfter}`)
  check('"from creators" incremented by 1', creatorsAfter === creatorsBefore + 1, `${creatorsBefore} → ${creatorsAfter}`)
  // With 1 real contribution this slice should flip from estimate → "Emerging data"
  // (match the emerging note, since the methodology prose also says "Modeled estimates")
  const afterText = toText(afterHtml)
  check('badge flips to Emerging after a real contribution',
    /Emerging data/.test(afterText) && /Blends 1 real creator-reported deal/.test(afterText),
    `baseline real=${creatorsBefore}`)

  // 7. unfiltered "Latest contributions" shows our entry (Tech · YouTube · Integrated mid-roll)
  const root2 = await get('/benchmarks', cookie)
  const root2Html = await root2.text()
  check('Latest contributions lists the new entry', /Tech · YouTube · Integrated mid-roll/.test(toText(root2Html)))

  // 8. cleanup
  await db.rateBenchmark.delete({ where: { id: inserted.id } })
  await db.user.delete({ where: { id: user.id } })
  check('cleanup (benchmark + user deleted)', true)

  console.log(`\n${fail === 0 ? '✅ ALL PASSED' : '❌ FAILURES'}  (${pass} passed, ${fail} failed)`)
  await db.$disconnect()
  process.exit(fail === 0 ? 0 : 1)
}

main().catch(async (e) => {
  console.error('PROBE ERROR:', e)
  await db.$disconnect()
  process.exit(1)
})
