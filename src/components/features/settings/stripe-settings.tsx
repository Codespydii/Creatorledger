'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, ExternalLink, Loader2, Trash2 } from 'lucide-react'
import { saveStripeKey, removeStripeKey } from '@/app/actions/stripe-actions'

export function StripeSettings({ hasKey }: { hasKey: boolean }) {
  const [connected, setConnected] = useState(hasKey)
  const [key, setKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (!key.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await saveStripeKey(key.trim())
      if (result.error) {
        setError(result.error)
      } else {
        setConnected(true)
        setKey('')
      }
    })
  }

  function handleRemove() {
    startTransition(async () => {
      await removeStripeKey()
      setConnected(false)
    })
  }

  if (connected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-emerald-700">Stripe connected</p>
            <p className="text-xs text-emerald-600/80">Pay links will be generated using your account</p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Connect Stripe to generate one-click payment links on your invoices. Clients pay directly — money goes straight to your Stripe account.{' '}
        <a
          href="https://dashboard.stripe.com/apikeys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-primary hover:underline"
        >
          Get your API key <ExternalLink className="h-3 w-3" />
        </a>
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="sk_live_... or sk_test_..."
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleSave}
          disabled={isPending || !key.trim()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Connect
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        For best security, use a{' '}
        <a
          href="https://dashboard.stripe.com/apikeys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          restricted key
        </a>{' '}
        with Payment Links (read + write) permission only.
      </p>
    </div>
  )
}
