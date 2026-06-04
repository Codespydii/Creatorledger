'use client'

import { useState, useTransition } from 'react'
import { MailWarning, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { resendVerificationEmail } from '@/app/actions/auth'

interface Props {
  email: string
}

export function VerifyEmailBanner({ email }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [pending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  if (dismissed) return null

  const handleResend = () => {
    startTransition(async () => {
      const result = await resendVerificationEmail()
      if (result?.success) {
        setSent(true)
        toast.success('Verification email sent')
      } else {
        const msg = (result && 'error' in result ? result.error : null) ?? 'Failed to send verification email'
        toast.error(msg)
      }
    })
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-200/70 bg-amber-50/80 backdrop-blur-sm dark:border-amber-900/40 dark:bg-amber-950/30"
    >
      <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          {sent ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          ) : (
            <MailWarning className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          )}
          <p className="text-sm text-foreground min-w-0">
            {sent ? (
              <>
                Verification email sent to{' '}
                <strong className="font-semibold break-all">{email}</strong>. Check your inbox.
              </>
            ) : (
              <>
                Please verify your email — we sent a link to{' '}
                <strong className="font-semibold break-all">{email}</strong>.{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={pending}
                  className="font-medium text-primary underline-offset-2 hover:underline disabled:opacity-60 disabled:no-underline"
                >
                  {pending ? 'Sending…' : 'Resend'}
                </button>
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss verification banner"
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
