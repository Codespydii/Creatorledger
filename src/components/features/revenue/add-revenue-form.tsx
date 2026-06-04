'use client'

import { useState, useEffect, useActionState } from 'react'
import { toast } from 'sonner'
import { Plus, X, Info, Link2 } from 'lucide-react'
import { createRevenueEntry } from '@/app/actions/revenue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useEscapeKey } from '@/hooks/use-escape-key'
import { useDeepLinkOpen } from '@/hooks/use-deep-link-open'
import { currencySymbol } from '@/lib/currencies'

const sourceOptions = [
  { value: 'sponsorship',  label: 'Sponsorship / Brand Deal' },
  { value: 'adsense',      label: 'AdSense (YouTube)' },
  { value: 'tiktok_fund',  label: 'TikTok Creator Fund' },
  { value: 'memberships',  label: 'Memberships' },
  { value: 'patreon',      label: 'Patreon' },
  { value: 'substack',     label: 'Substack' },
  { value: 'podcast',      label: 'Podcast sponsorship' },
  { value: 'affiliate',    label: 'Affiliate' },
  { value: 'merchandise',  label: 'Merch / Products' },
  { value: 'tips',         label: 'Tips / Super Thanks' },
  { value: 'other',        label: 'Other' },
]

export interface RevenueDealOption {
  id: string
  brandName: string
}

/** When launched from a completed deal, pre-fills and links the payment to it. */
export interface RevenueLinkedDeal {
  dealId: string
  brandName: string
  amount?: string // dollars
}

interface AddRevenueFormProps {
  currency?: string
  autoOpen?: boolean
  /** Deals available to link a standalone payment to (optional picker). */
  deals?: RevenueDealOption[]
  /** Launched from a specific deal — locks the link and shows the payment-terms note. */
  linkedDeal?: RevenueLinkedDeal
  hideTrigger?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function AddRevenueForm({
  currency = 'USD',
  autoOpen = false,
  deals,
  linkedDeal,
  hideTrigger = false,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: AddRevenueFormProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [state, action, pending] = useActionState(createRevenueEntry, undefined)
  useDeepLinkOpen(autoOpen, () => setOpen(true))

  useEffect(() => {
    if (state?.success) {
      toast.success('Revenue added')
      setOpen(false)
      onSuccess?.()
    } else if (state && !state.success && state.error) {
      toast.error(state.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  useEscapeKey(() => setOpen(false), open)

  return (
    <>
      {!hideTrigger && (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Revenue
        </Button>
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="add-revenue-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 id="add-revenue-title" className="text-lg font-semibold text-foreground">
                  {linkedDeal ? 'Log payment' : 'Add Revenue Entry'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Money you&apos;ve already received. For a sponsorship you&apos;re still negotiating, use <strong className="font-medium">Brand Deals</strong>.
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground shrink-0 ml-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            {linkedDeal && (
              <div className="mb-4 space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                  <Link2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <span className="text-muted-foreground">Linked to deal</span>
                  <span className="font-medium text-foreground truncate">{linkedDeal.brandName}</span>
                </div>
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5 text-xs text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                    <p>
                      Completing a deal doesn&apos;t log revenue on its own — payment terms vary (Net-30, milestones,
                      half-upfront), so we wait for you to confirm the money actually landed. Log it here once it has.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {state && !state.success && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                {state.error}
              </div>
            )}

            <form action={action} className="space-y-4">
              {linkedDeal && <input type="hidden" name="dealId" value={linkedDeal.dealId} />}
              <Select
                id="source"
                name="source"
                label="Revenue Source"
                options={sourceOptions}
                placeholder="Select source"
                defaultValue={linkedDeal ? 'sponsorship' : undefined}
                required
              />
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                label="Amount"
                placeholder="0.00"
                leadingSlot={currencySymbol(currency)}
                defaultValue={linkedDeal?.amount || undefined}
                required
              />
              <Input
                id="description"
                name="description"
                type="text"
                label="Description"
                placeholder="e.g. January AdSense payment"
                defaultValue={linkedDeal ? `Payment — ${linkedDeal.brandName}` : undefined}
                required
              />
              {!linkedDeal && deals && deals.length > 0 && (
                <Select
                  id="dealId"
                  name="dealId"
                  label="Link to a brand deal (optional)"
                  placeholder="Not linked"
                  options={deals.map((d) => ({ value: d.id, label: d.brandName }))}
                />
              )}
              <Input
                id="platform"
                name="platform"
                type="text"
                label="Platform (optional)"
                placeholder="e.g. YouTube, Instagram"
              />
              <Input
                id="date"
                name="date"
                type="date"
                label="Date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? 'Saving…' : linkedDeal ? 'Log payment' : 'Add Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
