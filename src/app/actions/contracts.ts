'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { analyzeContract } from '@/lib/contract-analyzer'
import { extractDocxText } from '@/lib/docx'
import { friendlyGeminiError } from '@/lib/gemini'
import { verifyFileMatchesMime } from '@/lib/file-validation'
import { rateLimit, rateLimitErrorMessage, LIMITS } from '@/lib/rate-limit'
import type { ActionState } from '@/types'

const MAX_FILE_BYTES = 10 * 1024 * 1024
const MAX_TEXT_LEN = 20_000
const MIN_TEXT_LEN = 50

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const ALLOWED_MIME = new Set([
  'application/pdf',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
  DOCX_MIME,
])

export async function analyzeContractAction(
  _state: ActionState<{ contractId: string }>,
  formData: FormData,
): Promise<ActionState<{ contractId: string }>> {
  const session = await verifySession()

  const limited = await rateLimit(LIMITS.ai, session.userId)
  if (!limited.ok) return { success: false, error: rateLimitErrorMessage(limited) }

  const pastedText = (formData.get('text') as string | null)?.trim() || ''
  const file = formData.get('file') as File | null
  const hasFile = file && file.size > 0

  if (!hasFile && pastedText.length < MIN_TEXT_LEN) {
    return {
      success: false,
      error: `Paste at least ${MIN_TEXT_LEN} characters of contract text, or upload a PDF.`,
    }
  }

  if (pastedText.length > MAX_TEXT_LEN) {
    return { success: false, error: 'Pasted text is too long. Trim to under 20,000 characters.' }
  }

  if (hasFile) {
    if (file.size > MAX_FILE_BYTES) {
      return { success: false, error: 'File is larger than 10MB. Use a smaller file or paste text.' }
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return { success: false, error: 'Unsupported file type. Use PDF, plain text, or an image.' }
    }
  }

  // For .docx we extract text on the server (Gemini can't read the binary),
  // then feed it through the same text path. Stored back so the record keeps the source.
  let docxText: string | null = null

  let analysisData
  try {
    if (hasFile) {
      const arrayBuffer = await file.arrayBuffer()
      const buf = Buffer.from(arrayBuffer)
      if (!verifyFileMatchesMime(buf, file.type)) {
        return {
          success: false,
          error: 'File contents do not match its declared type. Re-export and try again.',
        }
      }

      if (file.type === DOCX_MIME) {
        let extracted: string
        try {
          extracted = await extractDocxText(buf)
        } catch {
          return {
            success: false,
            error: 'Could not read that Word document. Re-save it as a PDF or paste the text instead.',
          }
        }
        const combined = [pastedText, extracted].filter(Boolean).join('\n\n').trim()
        if (combined.length < MIN_TEXT_LEN) {
          return {
            success: false,
            error: "That Word document didn't contain enough readable text. Paste the contract text instead.",
          }
        }
        docxText = combined.slice(0, MAX_TEXT_LEN)
        analysisData = await analyzeContract({ text: docxText })
      } else {
        analysisData = await analyzeContract({
          file: { mimeType: file.type, base64Data: buf.toString('base64') },
          text: pastedText || undefined,
        })
      }
    } else {
      analysisData = await analyzeContract({ text: pastedText })
    }
  } catch (err) {
    console.error('[contracts] analysis failed:', err)
    return { success: false, error: friendlyGeminiError(err, 'Analysis failed. Try again.') }
  }

  const contract = await db.contract.create({
    data: {
      userId: session.userId,
      title: analysisData.title || (hasFile ? (file as File).name : 'Untitled contract'),
      brandName: analysisData.brand ?? null,
      sourceKind: hasFile ? 'file' : 'text',
      sourceText: docxText || pastedText || null,
      fileName: hasFile ? (file as File).name : null,
      fileMimeType: hasFile ? (file as File).type : null,
      fileSizeBytes: hasFile ? (file as File).size : null,
      analysisJson: JSON.stringify(analysisData),
      overallScore: analysisData.overallScore,
      status: 'completed',
    },
  })

  revalidatePath('/contracts')
  redirect(`/contracts/${contract.id}`)
}

export async function deleteContractAction(formData: FormData): Promise<void> {
  const session = await verifySession()
  const id = formData.get('id') as string
  if (!id) return

  const contract = await db.contract.findUnique({ where: { id }, select: { userId: true } })
  if (!contract || contract.userId !== session.userId) return

  await db.contract.delete({ where: { id } })
  revalidatePath('/contracts')
  redirect('/contracts')
}
