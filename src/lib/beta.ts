import 'server-only'
import { db } from '@/lib/db'

/** Number of creators who lock in the founding price. After this, new users pay regular price. */
export const FOUNDING_CAP = 50

/** Length of the founding beta, in weeks (used in landing copy). */
export const BETA_LENGTH_WEEKS = 4

export interface FoundingStats {
  used: number
  left: number
  cap: number
  isFull: boolean
}

/**
 * Live count of founding spots. Resilient: if the DB is unreachable (e.g. at
 * build time), it falls back to "all spots open" so the marketing page never
 * fails to render.
 */
export async function getFoundingStats(): Promise<FoundingStats> {
  try {
    const used = await db.user.count({ where: { isFoundingMember: true } })
    const left = Math.max(0, FOUNDING_CAP - used)
    return { used, left, cap: FOUNDING_CAP, isFull: left === 0 }
  } catch {
    return { used: 0, left: FOUNDING_CAP, cap: FOUNDING_CAP, isFull: false }
  }
}
