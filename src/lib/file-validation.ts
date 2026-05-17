import 'server-only'

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const JPEG_MAGIC = [0xff, 0xd8, 0xff]
const RIFF_MAGIC = [0x52, 0x49, 0x46, 0x46]
const WEBP_FOURCC = [0x57, 0x45, 0x42, 0x50]

function startsWith(buf: Buffer, prefix: number[]): boolean {
  if (buf.length < prefix.length) return false
  for (let i = 0; i < prefix.length; i++) {
    if (buf[i] !== prefix[i]) return false
  }
  return true
}

function matchesAtOffset(buf: Buffer, offset: number, bytes: number[]): boolean {
  if (buf.length < offset + bytes.length) return false
  for (let i = 0; i < bytes.length; i++) {
    if (buf[offset + i] !== bytes[i]) return false
  }
  return true
}

function isLikelyPlainText(buf: Buffer): boolean {
  const sample = buf.subarray(0, Math.min(buf.length, 256))
  let printable = 0
  for (const b of sample) {
    if (b === 0) return false
    if (b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126) || b >= 0x80) {
      printable++
    }
  }
  return sample.length === 0 || printable / sample.length > 0.9
}

export function detectFileKind(buf: Buffer): 'pdf' | 'png' | 'jpeg' | 'webp' | 'text' | 'unknown' {
  if (startsWith(buf, PDF_MAGIC)) return 'pdf'
  if (startsWith(buf, PNG_MAGIC)) return 'png'
  if (startsWith(buf, JPEG_MAGIC)) return 'jpeg'
  if (startsWith(buf, RIFF_MAGIC) && matchesAtOffset(buf, 8, WEBP_FOURCC)) return 'webp'
  if (isLikelyPlainText(buf)) return 'text'
  return 'unknown'
}

const MIME_TO_KIND: Record<string, ReturnType<typeof detectFileKind>> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/webp': 'webp',
  'text/plain': 'text',
}

export function verifyFileMatchesMime(buf: Buffer, claimedMime: string): boolean {
  const expected = MIME_TO_KIND[claimedMime]
  if (!expected) return false
  const actual = detectFileKind(buf)
  return actual === expected
}
