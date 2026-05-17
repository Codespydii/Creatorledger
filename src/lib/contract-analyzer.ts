import 'server-only'
import { z } from 'zod'
import { generate } from './gemini'
import { stripJsonCodeFence } from './utils'

const ANALYSIS_PROMPT = `You are a legal analyst specialized in creator-brand sponsorship contracts and briefs.
Analyze the provided contract or brief from the creator's perspective and extract the key terms.

Return ONLY a JSON object — no prose, no markdown — matching this exact structure:

{
  "title": "Brief title in 2-6 words (e.g., 'Nord VPN Mid-Roll Integration')",
  "brand": "Brand or company name, or null",
  "summary": "2-3 sentence plain-English overview of the deal",
  "deliverables": [
    { "item": "What the creator must produce", "deadline": "Deadline as written, or null" }
  ],
  "payment": {
    "totalAmount": "Total compensation as written (e.g. '$5,000'), or null",
    "schedule": "Payment terms (e.g. '50% upfront, 50% on delivery'), or null",
    "killFee": "Kill fee terms, or null if not specified"
  },
  "usageRights": {
    "duration": "How long brand can use the content (e.g. 'perpetual', '1 year'), or 'not specified'",
    "platforms": ["Platforms where brand may reuse the content"],
    "modifications": "Can brand edit the content? (e.g. 'yes', 'no', 'with creator approval', 'not specified')"
  },
  "exclusivity": {
    "exists": true|false,
    "category": "Category of exclusivity (e.g. 'competing VPN brands') or null",
    "duration": "Duration of exclusivity (e.g. '6 months') or null"
  },
  "redFlags": [
    {
      "severity": "high|medium|low",
      "issue": "Short label (max 8 words)",
      "explanation": "Why this matters for the creator (1-2 sentences)"
    }
  ],
  "missingClauses": [
    "Important clauses missing from the contract, like 'no kill fee' or 'no late payment penalty'"
  ],
  "overallScore": "good|fair|risky|predatory",
  "negotiationSuggestions": [
    "3-6 specific things the creator should counter for, in priority order"
  ]
}

Be especially vigilant about these high-risk patterns:
- Perpetual or unlimited usage rights without compensation
- Missing kill fees or cancellation clauses
- Broad exclusivity that limits future deals
- IP assignment or work-for-hire language
- Payment terms longer than NET-30
- One-sided indemnification clauses
- Morality or behavior clauses
- Mandatory revisions without limit
- Vague deliverables that invite scope creep
- Right of approval that blocks publication

If the document is not a sponsorship contract or brief, set overallScore to "good", redFlags to [], and explain in the summary that it doesn't appear to be a creator contract.

Return ONLY valid JSON. No backticks. No commentary.`

const DeliverableSchema = z.object({
  item: z.string(),
  deadline: z.string().nullable().optional(),
})

const RedFlagSchema = z.object({
  severity: z.enum(['high', 'medium', 'low']),
  issue: z.string(),
  explanation: z.string(),
})

export const ContractAnalysisSchema = z.object({
  title: z.string(),
  brand: z.string().nullable().optional(),
  summary: z.string(),
  deliverables: z.array(DeliverableSchema).default([]),
  payment: z.object({
    totalAmount: z.string().nullable().optional(),
    schedule: z.string().nullable().optional(),
    killFee: z.string().nullable().optional(),
  }),
  usageRights: z.object({
    duration: z.string(),
    platforms: z.array(z.string()).default([]),
    modifications: z.string(),
  }),
  exclusivity: z.object({
    exists: z.boolean(),
    category: z.string().nullable().optional(),
    duration: z.string().nullable().optional(),
  }),
  redFlags: z.array(RedFlagSchema).default([]),
  missingClauses: z.array(z.string()).default([]),
  overallScore: z.enum(['good', 'fair', 'risky', 'predatory']),
  negotiationSuggestions: z.array(z.string()).default([]),
})

export type ContractAnalysis = z.infer<typeof ContractAnalysisSchema>

export async function analyzeContract(input: {
  text?: string
  file?: { mimeType: string; base64Data: string }
}): Promise<ContractAnalysis> {
  const prompt = input.text
    ? `${ANALYSIS_PROMPT}\n\n---\nContract / brief text:\n\n${input.text}`
    : ANALYSIS_PROMPT

  const raw = await generate({
    prompt,
    attachment: input.file,
    responseMimeType: 'application/json',
    temperature: 0.2,
    maxOutputTokens: 4096,
  })

  let parsed: unknown
  try {
    parsed = JSON.parse(stripJsonCodeFence(raw))
  } catch {
    throw new Error('AI returned a malformed response. Try again or paste the contract as plain text.')
  }

  const result = ContractAnalysisSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error('AI response did not match expected structure. Try simplifying the input.')
  }

  return result.data
}
