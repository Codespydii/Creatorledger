'use server'

import { verifySession } from '@/lib/session'
import { extractDealFromEmail, type DealExtraction } from '@/lib/deal-extractor'
import { friendlyGeminiError, isGeminiConfigured } from '@/lib/gemini'
import { rateLimit, rateLimitErrorMessage, LIMITS } from '@/lib/rate-limit'

const MAX_TEXT_LEN = 10_000
const MIN_TEXT_LEN = 30

export type ExtractDealResult =
  | { success: true; data: DealExtraction }
  | { success: false; error: string }

export async function extractDealFromEmailAction(text: string): Promise<ExtractDealResult> {
  const session = await verifySession()

  const limited = await rateLimit(LIMITS.ai, session.userId)
  if (!limited.ok) return { success: false, error: rateLimitErrorMessage(limited) }

  if (!isGeminiConfigured()) {
    return { success: false, error: 'AI features are not configured. Set GEMINI_API_KEY first.' }
  }

  const trimmed = (text || '').trim()
  if (trimmed.length < MIN_TEXT_LEN) {
    return { success: false, error: `Paste at least ${MIN_TEXT_LEN} characters of email content.` }
  }
  if (trimmed.length > MAX_TEXT_LEN) {
    return { success: false, error: 'Email is too long. Trim to under 10,000 characters.' }
  }

  try {
    const data = await extractDealFromEmail(trimmed)
    if (!data.isSponsorship) {
      return {
        success: false,
        error: 'This doesn\'t look like a sponsorship email. Paste a brand-outreach email to extract a deal.',
      }
    }
    return { success: true, data }
  } catch (err) {
    console.error('[email-deals] extraction failed:', err)
    return { success: false, error: friendlyGeminiError(err, 'Extraction failed. Try again.') }
  }
}
