'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = 'idle' | 'loading' | 'success' | 'error'

interface EmailCaptureProps {
  className?: string
}

export function EmailCapture({ className }: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!EMAIL_RX.test(trimmed)) {
      setError('Please enter a valid email.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setError(null)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setError('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
          className,
        )}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>You&apos;re in. Check your inbox — your access link is on the way.</span>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('w-full max-w-md', className)}
      noValidate
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="Enter your email address"
          value={email}
          onChange={(ev) => {
            setEmail(ev.target.value)
            if (status === 'error') {
              setStatus('idle')
              setError(null)
            }
          }}
          disabled={status === 'loading'}
          aria-invalid={status === 'error'}
          aria-describedby={error ? 'email-capture-error' : undefined}
          className="h-11 flex-1 rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 w-full sm:w-auto"
        >
          {status === 'loading' ? (
            'Sending...'
          ) : (
            <>
              Claim founding spot <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      {status === 'error' && error && (
        <p id="email-capture-error" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  )
}
