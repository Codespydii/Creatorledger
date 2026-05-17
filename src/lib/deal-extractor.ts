import 'server-only'
import { z } from 'zod'
import { generate } from './gemini'
import { stripJsonCodeFence } from './utils'

const EXTRACTION_PROMPT = `You are an assistant that extracts structured sponsorship deal information from raw emails sent to creators.

The input may be a full email (with headers, signature, threading) or just a pasted body. Treat it from the CREATOR's perspective — the recipient.

Return ONLY a JSON object — no prose, no markdown — matching this exact structure:

{
  "brandName": "Company / brand name (e.g. 'Notion', 'Squarespace'). Use the sender's company, not the sender's personal name. Required.",
  "contactName": "Sender's personal name (e.g. 'Sarah Chen') or null",
  "contactEmail": "Sender's email address or null",
  "stage": "prospect | outreach | negotiation",
  "value": "Numeric USD value of the offer if mentioned (decimal, e.g. 3500) or null",
  "deliverables": "What the brand wants (e.g. '1 integrated mid-roll, 2 IG stories') or null",
  "startDate": "Suggested or required start date as YYYY-MM-DD or null",
  "endDate": "Suggested or required end date / publish date as YYYY-MM-DD or null",
  "notes": "1-3 sentence summary capturing anything important not above: exclusivity, urgency, payment terms, key questions to clarify, recommended next action",
  "isSponsorship": true|false,
  "confidence": "high|medium|low"
}

Stage logic:
- "prospect" — cold outreach, brand introducing themselves, no specifics yet
- "outreach" — brand has specifics (deliverables, possibly value) and is asking if you're interested
- "negotiation" — back-and-forth on terms is happening, or you've already agreed in principle

If the email is NOT a sponsorship/brand-deal inquiry, set isSponsorship = false, brandName = "Not a sponsorship", and leave other fields null.

Be conservative with dates — only fill if explicit. Use today's date as reference for relative terms like "next month".

Return ONLY valid JSON. No backticks. No commentary.`

export const DealExtractionSchema = z.object({
  brandName: z.string(),
  contactName: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  stage: z.enum(['prospect', 'outreach', 'negotiation']).default('outreach'),
  value: z.number().nullable().optional(),
  deliverables: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isSponsorship: z.boolean().default(true),
  confidence: z.enum(['high', 'medium', 'low']).default('medium'),
})

export type DealExtraction = z.infer<typeof DealExtractionSchema>

export async function extractDealFromEmail(text: string): Promise<DealExtraction> {
  const raw = await generate({
    prompt: `${EXTRACTION_PROMPT}\n\n---\nEmail content:\n\n${text}`,
    responseMimeType: 'application/json',
    temperature: 0.2,
    maxOutputTokens: 1024,
  })

  let parsed: unknown
  try {
    parsed = JSON.parse(stripJsonCodeFence(raw))
  } catch {
    throw new Error('AI returned a malformed response. Try again or simplify the email.')
  }

  const result = DealExtractionSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error('AI response did not match expected structure.')
  }
  return result.data
}
