'use client'

import { useState, useEffect, useActionState } from 'react'
import { Plus, X } from 'lucide-react'
import { createRevenueEntry } from '@/app/actions/revenue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useEscapeKey } from '@/hooks/use-escape-key'
import { currencySymbol } from '@/lib/currencies'

const sourceOptions = [
  { value: 'adsense', label: 'AdSense' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'brand_deal', label: 'Brand Deal' },
  { value: 'merchandise', label: 'Merchandise' },
  { value: 'other', label: 'Other' },
]

interface AddRevenueFormProps {
  currency?: string
}

export function AddRevenueForm({ currency = 'USD' }: AddRevenueFormProps = {}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createRevenueEntry, undefined)

  useEffect(() => {
    if (state?.success) setOpen(false)
  }, [state])

  useEscapeKey(() => setOpen(false), open)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Revenue
      </Button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="add-revenue-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 id="add-revenue-title" className="text-lg font-semibold text-foreground">Add Revenue Entry</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Money you&apos;ve already received. For a sponsorship you&apos;re still negotiating, use <strong className="font-medium">Brand Deals</strong>.
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground shrink-0 ml-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            {state && !state.success && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <form action={action} className="space-y-4">
              <Select
                id="source"
                name="source"
                label="Revenue Source"
                options={sourceOptions}
                placeholder="Select source"
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
                required
              />
              <Input
                id="description"
                name="description"
                type="text"
                label="Description"
                placeholder="e.g. January AdSense payment"
                required
              />
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
                  {pending ? 'Saving…' : 'Add Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
