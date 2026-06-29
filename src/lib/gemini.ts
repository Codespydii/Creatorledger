import 'server-only'

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'

export class GeminiConfigError extends Error {
  constructor() {
    super('GEMINI_API_KEY is not configured. Add it to your .env.local to enable AI features.')
    this.name = 'GeminiConfigError'
  }
}

export class GeminiApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'GeminiApiError'
  }
}

export type GeminiFinishReason = 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER'

export class GeminiResponseError extends Error {
  reason: GeminiFinishReason
  raw: string
  constructor(reason: GeminiFinishReason, raw: string) {
    super(`Gemini response did not complete: ${reason}`)
    this.name = 'GeminiResponseError'
    this.reason = reason
    this.raw = raw
  }
}

interface GenerateOptions {
  prompt: string
  attachment?: {
    mimeType: string
    base64Data: string
  }
  responseMimeType?: 'text/plain' | 'application/json'
  temperature?: number
  maxOutputTokens?: number
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY)
}

/**
 * Maps any Gemini error to safe, friendly, user-facing copy. Never exposes raw
 * provider text, status bodies, or finish reasons to the end user. Callers should
 * still log the original error server-side for debugging.
 */
export function friendlyGeminiError(
  err: unknown,
  fallback = 'Something went wrong with the AI service. Please try again.',
): string {
  if (err instanceof GeminiConfigError) {
    return 'AI features are not configured yet. Set GEMINI_API_KEY in your environment.'
  }
  if (err instanceof GeminiResponseError) {
    if (err.reason === 'MAX_TOKENS') {
      return 'The document was too long for the AI to finish reading. Try a shorter excerpt or paste just the key sections.'
    }
    // SAFETY, RECITATION, OTHER
    return "The AI couldn't process this content. Try a different file, or paste the text directly."
  }
  if (err instanceof GeminiApiError) {
    if (err.status === 429) {
      return 'The AI service is busy right now. Wait a few seconds and try again.'
    }
    if (err.status === 400) {
      return "The AI couldn't read this content. Try a different file, or paste the text directly."
    }
    if (err.status >= 500) {
      return 'The AI service is temporarily unavailable. Please try again in a moment.'
    }
  }
  return fallback
}

export async function generate(options: GenerateOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new GeminiConfigError()

  const parts: Array<Record<string, unknown>> = [{ text: options.prompt }]
  if (options.attachment) {
    parts.push({
      inline_data: {
        mime_type: options.attachment.mimeType,
        data: options.attachment.base64Data,
      },
    })
  }

  const body = {
    contents: [{ parts }],
    generationConfig: {
      temperature: options.temperature ?? 0.2,
      maxOutputTokens: options.maxOutputTokens ?? 4096,
      ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
    },
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const sanitized = text.replace(apiKey, '[REDACTED]').slice(0, 300)
    throw new GeminiApiError(res.status, `Gemini API ${res.status}: ${sanitized}`)
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
      finishReason?: string
    }>
    promptFeedback?: { blockReason?: string }
  }

  if (json.promptFeedback?.blockReason) {
    throw new GeminiApiError(400, `Request blocked: ${json.promptFeedback.blockReason}`)
  }

  const candidate = json.candidates?.[0]
  const text = candidate?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  const finishReason = (candidate?.finishReason ?? 'OTHER') as GeminiFinishReason

  if (finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
    // SAFETY, RECITATION, OTHER — anything other than a clean stop or token cap
    throw new GeminiResponseError(finishReason, text)
  }
  if (finishReason === 'MAX_TOKENS') {
    // Output was cut off mid-stream; surface so callers can advise the user
    throw new GeminiResponseError('MAX_TOKENS', text)
  }
  if (!text) throw new GeminiApiError(500, 'Empty response from Gemini')
  return text
}
