import 'server-only'
import mammoth from 'mammoth'

/**
 * Extract plain text from a .docx (Office Open XML) buffer.
 *
 * Gemini's inline-data API can't read .docx binaries directly the way it reads
 * PDFs/images/plain text, so we pull the text out here and feed it through the
 * analyzer as pasted text instead.
 */
export async function extractDocxText(buf: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: buf })
  return result.value.trim()
}
