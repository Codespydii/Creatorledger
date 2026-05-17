'use client'

import { Suspense, useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GoogleSignInButton } from '@/components/shared/google-signin-button'

const ERRORS: Record<string, string> = {
  google_cancelled: 'Google sign-in was cancelled.',
  google_failed: 'Google sign-in failed. Please try again.',
}

const ERROR_DETAILS: Record<string, string> = {
  missing_params: 'Google sent us back without a code. Try again.',
  bad_state: 'Sign-in request expired (>10 minutes). Try again.',
  exchange_failed: 'Could not exchange the code with Google. Check server logs.',
  id_token_invalid: 'Google returned a malformed identity token.',
  email_unverified: 'Your Google account email is not verified.',
  invalid_credentials: 'Server credentials rejected by Google — Client ID or Secret is wrong.',
  wrong_client_id: 'Token audience does not match. Server has the wrong Client ID.',
  bad_signature: 'Could not verify Google\'s signature. Try again.',
  wrong_issuer: 'Token issuer mismatch.',
  db_or_session: 'Signed in with Google but failed to create the session.',
  google_redirect_uri_mismatch: 'Redirect URI is not registered in Google Console.',
  google_invalid_client: 'Client ID is not recognized by Google.',
  google_invalid_request: 'Google rejected the request shape.',
  google_unauthorized_client: 'Client is not authorized for this grant type.',
  google_access_denied: 'Access was denied.',
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const [state, action, pending] = useActionState(login, undefined)
  const sp = useSearchParams()
  const oauthError = sp.get('error')
  const oauthDetail = sp.get('detail')
  const baseMessage = oauthError ? ERRORS[oauthError] : null
  const detailMessage = oauthDetail ? ERROR_DETAILS[oauthDetail] ?? oauthDetail : null
  const oauthMessage = baseMessage && detailMessage
    ? `${baseMessage} (${detailMessage})`
    : baseMessage

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary mb-4">
            <span className="text-white font-bold text-lg">CL</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your Creator Ledger account</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
          {oauthMessage && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {oauthMessage}
            </div>
          )}

          <GoogleSignInButton label="Continue with Google" />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">or with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {state && !state.success && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
              error={state?.success === false ? state.fieldErrors?.email?.[0] : undefined}
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={state?.success === false ? state.fieldErrors?.password?.[0] : undefined}
            />
            <div className="flex justify-end -mt-2">
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
