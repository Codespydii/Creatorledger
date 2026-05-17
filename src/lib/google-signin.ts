import 'server-only'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { z } from 'zod'

export const GOOGLE_SIGNIN_SCOPES = ['openid', 'email', 'profile']

const GOOGLE_ISSUER = 'https://accounts.google.com'
const GOOGLE_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs'

let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null
function getJwks() {
  if (!cachedJwks) cachedJwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URI))
  return cachedJwks
}

export class GoogleSignInConfigError extends Error {
  constructor() {
    super('Google Sign-In is not configured. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.')
    this.name = 'GoogleSignInConfigError'
  }
}

export class GoogleSignInError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'GoogleSignInError'
  }
}

export function isGoogleSignInConfigured(): boolean {
  return Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET)
}

export function getSignInRedirectUri(): string {
  if (process.env.GOOGLE_SIGNIN_REDIRECT_URI) return process.env.GOOGLE_SIGNIN_REDIRECT_URI
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/api/oauth/google/callback`
}

export function buildSignInAuthUrl(state: string): string {
  if (!isGoogleSignInConfigured()) throw new GoogleSignInConfigError()
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    redirect_uri: getSignInRedirectUri(),
    response_type: 'code',
    scope: GOOGLE_SIGNIN_SCOPES.join(' '),
    access_type: 'online',
    prompt: 'select_account',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

interface TokenResponse {
  access_token: string
  id_token: string
  expires_in: number
  scope: string
  token_type: string
}

async function exchangeCode(code: string): Promise<TokenResponse> {
  if (!isGoogleSignInConfigured()) throw new GoogleSignInConfigError()

  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    redirect_uri: getSignInRedirectUri(),
    grant_type: 'authorization_code',
  })

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new GoogleSignInError(res.status, `Token exchange failed: ${text.slice(0, 200)}`)
  }
  return (await res.json()) as TokenResponse
}

const IdTokenClaimsSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  email_verified: z.union([z.boolean(), z.string()]).transform(v => v === true || v === 'true'),
  name: z.string().optional(),
  given_name: z.string().optional(),
  picture: z.string().url().optional(),
})

export interface GoogleIdentity {
  googleId: string
  email: string
  emailVerified: boolean
  name: string
  picture: string | null
}

export async function signInWithCode(code: string): Promise<GoogleIdentity> {
  const tokens = await exchangeCode(code)
  if (!tokens.id_token) throw new GoogleSignInError(500, 'Google did not return an id_token')

  const { payload } = await jwtVerify(tokens.id_token, getJwks(), {
    issuer: [GOOGLE_ISSUER, 'accounts.google.com'],
    audience: process.env.GOOGLE_OAUTH_CLIENT_ID!,
  })

  const parsed = IdTokenClaimsSchema.safeParse(payload)
  if (!parsed.success) throw new GoogleSignInError(400, 'Malformed id_token claims')

  const claims = parsed.data
  if (!claims.email_verified) throw new GoogleSignInError(400, 'Google email is not verified')

  return {
    googleId: claims.sub,
    email: claims.email.toLowerCase(),
    emailVerified: true,
    name: claims.name || claims.given_name || claims.email.split('@')[0],
    picture: claims.picture ?? null,
  }
}
