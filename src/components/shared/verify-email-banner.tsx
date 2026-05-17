'use client'

import { useState, useTransition } from 'react'
import { MailWarning, X, CheckCircle2 } from 'lucide-react'
import { resendVerificationEmail } from '@/app/actions/auth'

interface Props {
  email: string
}

export function VerifyEmailBanner({ email }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [pending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (dismissed) return null

  const handleResend = () => {
    setError(null)
    startTransition(async () => {
      const result = await resendVerificationEmail()
      if (result?.success) {
        setSent(true)
      } else {
        setError((result && 'error' in result ? result.error : null) ?? 'Failed to send')
      }
    })
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-3 px-6 py-2.5">
        <div className="flex items-start gap-2.5">
          {sent ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
          ) : (
            <MailWarning className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
          )}
          <p className="text-sm text-amber-900">
            {sent ? (
              <>
                Verification email sent to <strong className="font-semibold">{email}</strong>. Check your inbox.
              </>
            ) : (
              <>
                Please verify your email — we sent a link to <strong className="font-semibold">{email}</strong>.{' '}
                <button
                  onClick={handleResend}
                  disabled={pending}
                  className="underline font-medium hover:text-amber-950 disabled:opacity-60"
                >
                  {pending ? 'Sending…' : 'Resend'}
                </button>
                {error && <span className="ml-2 text-red-700">· {error}</span>}
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="text-amber-600 hover:text-amber-900 shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
