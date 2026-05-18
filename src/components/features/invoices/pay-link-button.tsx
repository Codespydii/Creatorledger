'use client'

import { useState, useTransition } from 'react'
import { Link2, Copy, Check, Loader2 } from 'lucide-react'
import { generatePayLink } from '@/app/actions/stripe-actions'

interface Props {
  invoiceId: string
  existingUrl?: string | null
}

export function PayLinkButton({ invoiceId, existingUrl }: Props) {
  const [url, setUrl] = useState(existingUrl ?? null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleGenerate() {
    setError(null)
    startTransition(async () => {
      const result = await generatePayLink(invoiceId)
      if (result.error) setError(result.error)
      else if (result.url) setUrl(result.url)
    })
  }

  function handleCopy() {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (url) {
    return (
      <button
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy payment link'}
        className="inline-flex items-center justify-center rounded-full border border-emerald-200 p-1.5 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleGenerate}
        disabled={isPending}
        title="Generate Stripe pay link"
        className="inline-flex items-center justify-center rounded-full border border-violet-200 p-1.5 text-violet-600 hover:border-violet-400 hover:bg-violet-50 dark:border-violet-900 dark:text-violet-400 dark:hover:border-violet-700 dark:hover:bg-violet-950/30 transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
      </button>
      {error && (
        <div className="absolute right-0 top-9 z-50 w-56 rounded-lg border border-destructive/30 bg-card px-3 py-2 text-xs text-destructive shadow-lg">
          {error}
        </div>
      )}
    </div>
  )
}
