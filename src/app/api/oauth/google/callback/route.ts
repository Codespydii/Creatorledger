import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession } from '@/lib/session'
import { verifySignInState } from '@/lib/oauth-state'
import { signInWithCode, GoogleSignInError } from '@/lib/google-signin'

function redirectToLogin(req: NextRequest, error: string, detail?: string): NextResponse {
  const url = new URL('/login', req.url)
  url.searchParams.set('error', error)
  if (detail) url.searchParams.set('detail', detail)
  return NextResponse.redirect(url)
}

function logFailure(label: string, err: unknown) {
  const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
  // Show full stack in Vercel function logs so we can debug
  if (err instanceof Error && err.stack) {
    console.error(`[google-signin] ${label}\n${err.stack}`)
  } else {
    console.error(`[google-signin] ${label} — ${message}`)
  }
  // Best-effort Sentry capture (lazy import — no-op if Sentry not configured)
  import('@sentry/nextjs').then(s => {
    if (err instanceof Error) s.captureException(err, { tags: { route: 'google-callback', step: label } })
    else s.captureMessage(`google-signin ${label}: ${message}`, 'error')
  }).catch(() => { /* Sentry not loaded — fine */ })
  return message
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const oauthError = req.nextUrl.searchParams.get('error')
  const oauthErrorDesc = req.nextUrl.searchParams.get('error_description')

  if (oauthError === 'access_denied') return redirectToLogin(req, 'google_cancelled')
  if (oauthError) {
    console.error(`[google-signin] Google returned error=${oauthError} description="${oauthErrorDesc ?? ''}"`)
    return redirectToLogin(req, 'google_failed', `google_${oauthError}`)
  }
  if (!code || !state) {
    console.error(`[google-signin] missing code or state — code=${Boolean(code)} state=${Boolean(state)}`)
    return redirectToLogin(req, 'google_failed', 'missing_params')
  }

  const stateOk = await verifySignInState(state, 'google')
  if (!stateOk) {
    console.error('[google-signin] state JWT failed to verify (expired or signed with different SESSION_SECRET)')
    return redirectToLogin(req, 'google_failed', 'bad_state')
  }

  let identity
  try {
    identity = await signInWithCode(code)
  } catch (err) {
    logFailure('signInWithCode', err)
    let detail = 'exchange_failed'
    if (err instanceof GoogleSignInError) {
      if (err.message.includes('id_token')) detail = 'id_token_invalid'
      else if (err.message.includes('email is not verified')) detail = 'email_unverified'
      else if (err.status === 401 || err.status === 403) detail = 'invalid_credentials'
    } else if (err instanceof Error) {
      if (err.message.includes('audience')) detail = 'wrong_client_id'
      else if (err.message.includes('signature')) detail = 'bad_signature'
      else if (err.message.includes('issuer')) detail = 'wrong_issuer'
    }
    return redirectToLogin(req, 'google_failed', detail)
  }

  try {
    // 1) Match by googleId — returning user
    let user = await db.user.findUnique({ where: { googleId: identity.googleId } })

    // 2) Match by email — existing password account → link Google
    if (!user) {
      const byEmail = await db.user.findUnique({ where: { email: identity.email } })
      if (byEmail) {
        user = await db.user.update({
          where: { id: byEmail.id },
          data: {
            googleId: identity.googleId,
            avatarUrl: byEmail.avatarUrl ?? identity.picture,
          },
        })
      }
    }

    // 3) Create new user — no password
    let isNew = false
    if (!user) {
      user = await db.user.create({
        data: {
          email: identity.email,
          name: identity.name,
          googleId: identity.googleId,
          avatarUrl: identity.picture,
        },
      })
      isNew = true
    }

    await createSession(user.id, user.email)

    const dest = new URL(isNew ? '/onboarding' : '/dashboard', req.url)
    return NextResponse.redirect(dest)
  } catch (err) {
    logFailure('db_or_session', err)
    return redirectToLogin(req, 'google_failed', 'db_or_session')
  }
}
