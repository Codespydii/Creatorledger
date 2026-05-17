'use client'

import { useActionState } from 'react'
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

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)
  const sp = useSearchParams()
  const oauthError = sp.get('error')
  const oauthMessage = oauthError ? ERRORS[oauthError] : null

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
