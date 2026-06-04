'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, X, Info, ShieldCheck } from 'lucide-react'
import { contributeRate, contributeVerifiedRate } from '@/app/actions/benchmarks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useEscapeKey } from '@/hooks/use-escape-key'
import { NICHES, PLATFORMS, FORMATS, SUBSCRIBER_TIERS } from '@/lib/benchmarks-constants'

export interface VerifiedPrefill {
  dealId: string
  brandName: string
  amount?: string // dollars, pre-filled and editable
  platform?: string
  subscriberTier?: string
  niche?: string
}

interface ContributeFormProps {
  /** When set, contributes a verified rate linked to one of the user's deals. */
  verified?: VerifiedPrefill
  hideTrigger?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ContributeForm({ verified, hideTrigger = false, open: controlledOpen, onOpenChange }: ContributeFormProps = {}) {
  const isVerified = !!verified
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [platform, setPlatform] = useState(verified?.platform ?? '')
  const [state, action, pending] = useActionState(
    isVerified ? contributeVerifiedRate : contributeRate,
    undefined,
  )

  useEffect(() => {
    if (state?.success) {
      toast.success(isVerified ? 'Verified rate contributed — thanks!' : 'Rate contributed — thanks for sharing!')
      setOpen(false)
      if (!isVerified) setPlatform('')
    } else if (state && !state.success && state.error) {
      toast.error(state.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const formatOptions = FORMATS
    .filter((f) => !platform || f.platform === platform)
    .map(({ value, label }) => ({ value, label }))

  useEscapeKey(() => setOpen(false), open)

  return (
    <>
      {!hideTrigger && (
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Contribute a rate
        </Button>
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="contribute-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 id="contribute-title" className="text-lg font-semibold text-foreground">
                {isVerified ? "Contribute this deal's rate" : 'Contribute a rate'}
              </h2>
              <button onClick={() => setOpen(false)} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            {isVerified ? (
              <div className="mb-5 rounded-lg bg-emerald-50 border border-emerald-300 px-3 py-2.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <p>
                    Linked to your completed deal with <strong className="font-medium">{verified!.brandName}</strong> — it&apos;ll
                    be marked <strong className="font-medium">✓ verified</strong>. Only the rate details below are shared;
                    the brand name and your personal info never leave your account.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                    <p>
                      <strong className="font-medium">This is still a moderate, growing dataset.</strong> Today&apos;s
                      numbers lean on modeled estimates — every real rate you add directly sharpens the benchmarks for
                      creators like you. The more we contribute, the more accurate it gets.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-5">
                  Your contribution is fully anonymous — no brand name or personal details. Only the aggregate stats use your number.
                </p>
              </>
            )}

            {state && !state.success && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                {state.error}
              </div>
            )}

            <form action={action} className="space-y-4">
              {isVerified && <input type="hidden" name="dealId" value={verified!.dealId} />}
              <Select
                id="niche"
                name="niche"
                label="Niche"
                placeholder="Pick a niche"
                options={NICHES.map((n) => ({ value: n.value, label: n.label }))}
                defaultValue={verified?.niche || undefined}
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
                defaultValue={verified?.subscriberTier || undefined}
                required
              />
              <div>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min={1}
                  step="1"
                  label="Deal amount (USD)"
                  placeholder="3500"
                  defaultValue={verified?.amount || undefined}
                  required
                />
                {isVerified && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pre-filled from this deal. If it bundled multiple deliverables, enter just the portion for this format.
                  </p>
                )}
              </div>
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
                  {pending ? 'Saving…' : isVerified ? 'Contribute verified rate' : 'Contribute anonymously'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
