import 'server-only'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const FORMAT_VERSION = 'v1'
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

let cachedKey: Buffer | null = null
function getKey(): Buffer {
  if (cachedKey) return cachedKey
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set to a string of at least 32 characters')
  }
  cachedKey = createHash('sha256').update(`creator-ledger-seal:${secret}`).digest()
  return cachedKey
}

export function sealSecret(plaintext: string): string {
  if (!plaintext) return plaintext
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${FORMAT_VERSION}:${iv.toString('base64')}:${ciphertext.toString('base64')}:${authTag.toString('base64')}`
}

export function openSecret(value: string | null | undefined): string {
  if (!value) return ''
  if (!value.startsWith(`${FORMAT_VERSION}:`)) {
    return value
  }
  const parts = value.split(':')
  if (parts.length !== 4) {
    throw new Error('Malformed encrypted value')
  }
  const [, ivB64, ctB64, tagB64] = parts
  const iv = Buffer.from(ivB64, 'base64')
  const ciphertext = Buffer.from(ctB64, 'base64')
  const authTag = Buffer.from(tagB64, 'base64')
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(authTag)
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return plaintext.toString('utf8')
}

export function isSealed(value: string | null | undefined): boolean {
  return Boolean(value && value.startsWith(`${FORMAT_VERSION}:`))
}
