import 'server-only'
import { db } from './db'
import { SUBSCRIBER_TIERS } from './benchmarks-constants'

const NICHE_CPM_USD: Record<string, number> = {
  tech: 55,
  finance: 65,
  business: 50,
  education: 45,
  beauty: 42,
  fashion: 38,
  fitness: 35,
  food: 30,
  lifestyle: 32,
  travel: 35,
  gaming: 25,
  comedy: 22,
  music: 22,
  sports: 35,
  news: 40,
  other: 30,
}

const FORMAT_MULTIPLIER: Record<string, number> = {
  integrated: 1.0,
  dedicated: 2.4,
  shorts: 0.35,
  post: 0.6,
  reel: 0.9,
  story: 0.35,
  organic: 0.75,
  host_read: 0.85,
}

const VIEWS_PER_SUB_BY_PLATFORM: Record<string, number> = {
  youtube: 0.14,
  instagram: 0.08,
  tiktok: 0.5,
  podcast: 0.05,
}

const PLATFORM_FORMATS: Record<string, string[]> = {
  youtube: ['integrated', 'dedicated', 'shorts'],
  instagram: ['post', 'reel', 'story'],
  tiktok: ['organic'],
  podcast: ['host_read'],
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface SeedRow {
  niche: string
  platform: string
  format: string
  subscriberTier: string
  amountCents: number
  exclusivity: boolean
  source: string
}

export function generateSeedRecords(seed = 0xc0ffee): SeedRow[] {
  const rand = mulberry32(seed)
  const records: SeedRow[] = []

  for (const niche of Object.keys(NICHE_CPM_USD)) {
    const cpm = NICHE_CPM_USD[niche]
    for (const tier of SUBSCRIBER_TIERS) {
      const expectedViews = tier.midpoint * VIEWS_PER_SUB_BY_PLATFORM.youtube
      for (const [platform, formats] of Object.entries(PLATFORM_FORMATS)) {
        const platformViews = tier.midpoint * VIEWS_PER_SUB_BY_PLATFORM[platform]
        for (const format of formats) {
          const baseRate = (platformViews * cpm) / 1000 * FORMAT_MULTIPLIER[format]
          const samples = 3
          for (let i = 0; i < samples; i++) {
            const jitter = 0.7 + rand() * 0.6
            const exclusivity = rand() < 0.18
            const exclusivityBoost = exclusivity ? 1.15 + rand() * 0.2 : 1
            const amount = Math.max(50, Math.round(baseRate * jitter * exclusivityBoost))
            records.push({
              niche,
              platform,
              format,
              subscriberTier: tier.value,
              amountCents: amount * 100,
              exclusivity,
              source: 'seed',
            })
          }
          // Unused but kept for clarity that yt expectedViews is the calibration point
          void expectedViews
        }
      }
    }
  }
  return records
}

export async function ensureSeedBenchmarks(): Promise<void> {
  const count = await db.rateBenchmark.count({ where: { source: 'seed' } })
  if (count > 0) return
  const records = generateSeedRecords()
  for (let i = 0; i < records.length; i += 200) {
    await db.rateBenchmark.createMany({ data: records.slice(i, i + 200) })
  }
}
