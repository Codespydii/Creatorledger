'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GoogleSignInButton } from '@/components/shared/google-signin-button'
import { PasswordStrength } from '@/components/shared/password-strength'

const ERRORS: Record<string, string> = {
  google_cancelled: 'Google sign-in was cancelled. Try again or use email below.',
  google_failed: 'Google sign-in failed. Please try again.',
}

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)
  const [password, setPassword] = useState('')
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
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Free during beta. No credit card.</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
          {oauthMessage && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {oauthMessage}
            </div>
          )}

          <GoogleSignInButton label="Sign up with Google" />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">or with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {state && !state.success && !state.fieldErrors && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <Input
              id="name"
              name="name"
              type="text"
              label="Full name"
              placeholder="Alex Johnson"
              autoComplete="name"
              error={state?.success === false ? state.fieldErrors?.name?.[0] : undefined}
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
              error={state?.success === false ? state.fieldErrors?.email?.[0] : undefined}
            />
            <div className="flex flex-col gap-2">
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                error={state?.success === false ? state.fieldErrors?.password?.[0] : undefined}
              />
              <PasswordStrength value={password} />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5 leading-relaxed">
          By creating an account, you agree to our{' '}
          <Link href="/legal/terms" className="underline hover:text-foreground">Terms</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
