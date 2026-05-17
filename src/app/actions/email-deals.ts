'use server'

import { verifySession } from '@/lib/session'
import { extractDealFromEmail, type DealExtraction } from '@/lib/deal-extractor'
import { GeminiConfigError, isGeminiConfigured } from '@/lib/gemini'

const MAX_TEXT_LEN = 10_000
const MIN_TEXT_LEN = 30

export type ExtractDealResult =
  | { success: true; data: DealExtraction }
  | { success: false; error: string }

export async function extractDealFromEmailAction(text: string): Promise<ExtractDealResult> {
  await verifySession()

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
    if (err instanceof GeminiConfigError) {
      return { success: false, error: 'AI features are not configured.' }
    }
    const message = err instanceof Error ? err.message : 'Extraction failed. Try again.'
    return { success: false, error: message }
  }
}
