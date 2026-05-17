import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession } from '@/lib/session'
import { verifySignInState } from '@/lib/oauth-state'
import { signInWithCode } from '@/lib/google-signin'

function redirectToLogin(req: NextRequest, error: string): NextResponse {
  const url = new URL('/login', req.url)
  url.searchParams.set('error', error)
  return NextResponse.redirect(url)
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const oauthError = req.nextUrl.searchParams.get('error')

  if (oauthError === 'access_denied') return redirectToLogin(req, 'google_cancelled')
  if (oauthError || !code || !state) return redirectToLogin(req, 'google_failed')

  const stateOk = await verifySignInState(state, 'google')
  if (!stateOk) return redirectToLogin(req, 'google_failed')

  try {
    const identity = await signInWithCode(code)

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
    console.error('Google sign-in callback failed:', err instanceof Error ? err.message : err)
    return redirectToLogin(req, 'google_failed')
  }
}
