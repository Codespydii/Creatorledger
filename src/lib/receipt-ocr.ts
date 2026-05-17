import 'server-only'
import { z } from 'zod'
import { generate } from './gemini'
import { stripJsonCodeFence } from './utils'

const OCR_PROMPT = `You are an OCR system specialized in expense receipts for creator businesses.
Extract structured data from the receipt image or document.

Return ONLY a JSON object — no prose, no markdown — matching this exact structure:

{
  "vendor": "Merchant or vendor name, or null",
  "amount": Number (total amount paid, including tax — in the receipt's currency, as a decimal number e.g. 42.99) or null,
  "currency": "ISO 4217 currency code (default 'USD' if unclear)",
  "date": "YYYY-MM-DD of the transaction, or null if unreadable",
  "category": "One of: equipment, software, travel, marketing, contractor, office, taxes, other",
  "description": "Brief 3-8 word description of what was purchased",
  "confidence": "high|medium|low"
}

Category guidance:
- equipment: cameras, lighting, microphones, tripods, computers, hardware
- software: SaaS subscriptions, Adobe, editing tools, plugins, AI tools, hosting
- travel: flights, hotels, Uber/Lyft, gas, mileage, meals while traveling
- marketing: ads, promotions, design services, sponsored placements
- contractor: editors, thumbnail designers, VAs, freelancers, agencies
- office: rent, utilities, internet, office supplies, coworking
- taxes: tax payments, accountant fees, tax software
- other: anything that doesn't fit above

If the image is not a receipt, set every field to null except category ("other"), description ("Not a receipt"), and confidence ("low").

Use the receipt's grand total, not the subtotal. If tip is added, include it in the amount.

Return ONLY valid JSON. No backticks. No commentary.`

export const ReceiptDataSchema = z.object({
  vendor: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  currency: z.string().default('USD'),
  date: z.string().nullable().optional(),
  category: z.enum(['equipment', 'software', 'travel', 'marketing', 'contractor', 'office', 'taxes', 'other']).default('other'),
  description: z.string().default(''),
  confidence: z.enum(['high', 'medium', 'low']).default('low'),
})

export type ReceiptData = z.infer<typeof ReceiptDataSchema>

export async function scanReceipt(file: { mimeType: string; base64Data: string }): Promise<ReceiptData> {
  const raw = await generate({
    prompt: OCR_PROMPT,
    attachment: file,
    responseMimeType: 'application/json',
    temperature: 0.1,
    maxOutputTokens: 1024,
  })

  let parsed: unknown
  try {
    parsed = JSON.parse(stripJsonCodeFence(raw))
  } catch {
    throw new Error('Could not read receipt. Try a clearer image.')
  }

  const result = ReceiptDataSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error('Receipt data did not match expected format.')
  }
  return result.data
}
