'use server'

import { verifySession } from '@/lib/session'
import { scanReceipt, type ReceiptData } from '@/lib/receipt-ocr'
import { GeminiConfigError, isGeminiConfigured } from '@/lib/gemini'
import { verifyFileMatchesMime } from '@/lib/file-validation'

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
])

export type ScanReceiptResult =
  | { success: true; data: ReceiptData }
  | { success: false; error: string }

export async function scanReceiptAction(formData: FormData): Promise<ScanReceiptResult> {
  await verifySession()

  if (!isGeminiConfigured()) {
    return { success: false, error: 'AI scanning is not configured. Set GEMINI_API_KEY first.' }
  }

  const file = formData.get('receipt') as File | null
  if (!file || file.size === 0) {
    return { success: false, error: 'Pick a receipt image or PDF first.' }
  }
  if (file.size > MAX_FILE_BYTES) {
    return { success: false, error: 'File is larger than 10MB.' }
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { success: false, error: 'Unsupported file type. Use PNG, JPEG, WebP, or PDF.' }
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buf = Buffer.from(arrayBuffer)
    if (!verifyFileMatchesMime(buf, file.type)) {
      return {
        success: false,
        error: 'File contents do not match its declared type. Re-take the photo and try again.',
      }
    }
    const data = await scanReceipt({ mimeType: file.type, base64Data: buf.toString('base64') })
    return { success: true, data }
  } catch (err) {
    if (err instanceof GeminiConfigError) {
      return { success: false, error: 'AI scanning is not configured. Set GEMINI_API_KEY first.' }
    }
    const message = err instanceof Error ? err.message : 'Could not scan receipt. Try again.'
    return { success: false, error: message }
  }
}
