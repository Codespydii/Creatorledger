'use client'

import { useActionState, useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { contributeRate } from '@/app/actions/benchmarks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useEscapeKey } from '@/hooks/use-escape-key'
import { NICHES, PLATFORMS, FORMATS, SUBSCRIBER_TIERS } from '@/lib/benchmarks-constants'

export function ContributeForm() {
  const [open, setOpen] = useState(false)
  const [platform, setPlatform] = useState('')
  const [state, action, pending] = useActionState(contributeRate, undefined)

  useEffect(() => {
    if (state?.success) {
      setOpen(false)
      setPlatform('')
    }
  }, [state])

  const formatOptions = FORMATS
    .filter((f) => !platform || f.platform === platform)
    .map(({ value, label }) => ({ value, label }))

  useEscapeKey(() => setOpen(false), open)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Contribute a rate
      </Button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="contribute-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 id="contribute-title" className="text-lg font-semibold text-foreground">Contribute a rate</h2>
              <button onClick={() => setOpen(false)} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              Your contribution is fully anonymous — no brand name or personal details. Only the aggregate stats use your number.
            </p>

            {state && !state.success && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <form action={action} className="space-y-4">
              <Select
                id="niche"
                name="niche"
                label="Niche"
                placeholder="Pick a niche"
                options={NICHES.map((n) => ({ value: n.value, label: n.label }))}
                required
              />
              <Select
                id="platform"
                name="platform"
                label="Platform"
                placeholder="Pick a platform"
                options={PLATFORMS.map((p) => ({ value: p.value, label: p.label }))}
                value={platform}
                onChange={(e) => setPlatform(e.currentTarget.value)}
                required
              />
              <Select
                id="format"
                name="format"
                label="Format"
                placeholder={platform ? 'Pick a format' : 'Pick platform first'}
                options={formatOptions}
                disabled={!platform}
                required
              />
              <Select
                id="subscriberTier"
                name="subscriberTier"
                label="Your audience size"
                placeholder="Pick your size"
                options={SUBSCRIBER_TIERS.map((t) => ({ value: t.value, label: t.label }))}
                required
              />
              <Input
                id="amount"
                name="amount"
                type="number"
                min={1}
                step="50"
                label="Deal amount (USD)"
                placeholder="3500"
                required
              />
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  name="exclusivity"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Included exclusivity (e.g. competitor lockout)
              </label>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? 'Saving…' : 'Contribute anonymously'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
