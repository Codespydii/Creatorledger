import Link from 'next/link'
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { verifyEmail } from '@/app/actions/auth'

interface Props {
  params: Promise<{ token: string }>
}

export default async function VerifyEmailPage({ params }: Props) {
  const { token } = await params
  const result = await verifyEmail(token)

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center">
          {result.ok ? (
            <>
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-1">Email confirmed</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Your email is now verified. You can keep using Creator Ledger.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
              >
                Go to dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-1">Could not verify email</h1>
              <p className="text-sm text-muted-foreground mb-6">
                {result.error === 'Token expired'
                  ? 'This verification link expired. You can request a new one from your dashboard.'
                  : result.error === 'Token already used'
                  ? 'This link has already been used. You\'re probably already verified — try signing in.'
                  : 'This verification link is invalid. You can request a fresh one from your dashboard.'}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Go to dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
