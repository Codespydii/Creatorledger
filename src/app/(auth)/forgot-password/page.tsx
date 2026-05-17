'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { requestPasswordReset } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary mb-4">
            <span className="text-white font-bold text-lg">CL</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          {state?.success ? (
            <div className="text-center py-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Check your inbox</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                If an account exists with that email, we&apos;ve sent a reset link. The link expires in 60 minutes.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Didn&apos;t get it? Check your spam folder, or try again in a minute.
              </p>
            </div>
          ) : (
            <>
              {state && !state.success && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
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
                  required
                  error={state?.success === false ? state.fieldErrors?.email?.[0] : undefined}
                />
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Remembered it?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
