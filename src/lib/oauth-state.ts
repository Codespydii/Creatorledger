import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { z } from 'zod'

const secretKey = process.env.SESSION_SECRET
if (!secretKey || secretKey.length < 32) {
  throw new Error('SESSION_SECRET must be set to a string of at least 32 characters')
}
const encodedKey = new TextEncoder().encode(secretKey)

const OAuthStateSchema = z.object({
  userId: z.string().min(1),
  nonce: z.string().min(1),
  provider: z.string().min(1),
})

const SignInStateSchema = z.object({
  nonce: z.string().min(1),
  provider: z.string().min(1),
  intent: z.literal('signin'),
})

export async function signOAuthState(userId: string, provider: string): Promise<string> {
  const nonce = crypto.randomUUID()
  return new SignJWT({ userId, nonce, provider })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(encodedKey)
}

export async function verifyOAuthState(state: string, expectedProvider: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(state, encodedKey, { algorithms: ['HS256'] })
    const parsed = OAuthStateSchema.safeParse(payload)
    if (!parsed.success) return null
    if (parsed.data.provider !== expectedProvider) return null
    return { userId: parsed.data.userId }
  } catch {
    return null
  }
}

export async function signSignInState(provider: string): Promise<string> {
  const nonce = crypto.randomUUID()
  return new SignJWT({ nonce, provider, intent: 'signin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(encodedKey)
}

export async function verifySignInState(state: string, expectedProvider: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(state, encodedKey, { algorithms: ['HS256'] })
    const parsed = SignInStateSchema.safeParse(payload)
    return parsed.success && parsed.data.provider === expectedProvider
  } catch {
    return false
  }
}
