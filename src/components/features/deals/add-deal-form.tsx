'use client'

import { useState, useEffect, useActionState } from 'react'
import { Plus, X } from 'lucide-react'
import { createDeal } from '@/app/actions/deals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useEscapeKey } from '@/hooks/use-escape-key'
import { currencySymbol } from '@/lib/currencies'

const stageOptions = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'contracted', label: 'Contracted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

interface AddDealFormProps {
  currency?: string
}

export function AddDealForm({ currency = 'USD' }: AddDealFormProps = {}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createDeal, undefined)

  useEffect(() => {
    if (state?.success) setOpen(false)
  }, [state])

  useEscapeKey(() => setOpen(false), open)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Deal
      </Button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="add-deal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 id="add-deal-title" className="text-lg font-semibold text-foreground">Add Brand Deal</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track a sponsorship from outreach to payment. Once you&apos;re actually paid, log it as <strong className="font-medium">Revenue</strong>.
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
              <Input id="brandName" name="brandName" label="Brand Name" placeholder="Nike, Squarespace…" required />
              <div className="grid grid-cols-2 gap-3">
                <Input id="contactName" name="contactName" label="Contact Name" placeholder="Jane Smith" />
                <Input id="contactEmail" name="contactEmail" type="email" label="Contact Email" placeholder="jane@brand.com" />
              </div>
              <Select id="stage" name="stage" label="Stage" options={stageOptions} placeholder="Select stage" required />
              <Input id="value" name="value" type="number" step="0.01" min="0" label="Deal Value" placeholder="0.00" leadingSlot={currencySymbol(currency)} required />
              <Textarea id="deliverables" name="deliverables" label="Deliverables" placeholder="2x YouTube videos, 3x Instagram posts…" />
              <div className="grid grid-cols-2 gap-3">
                <Input id="startDate" name="startDate" type="date" label="Start Date" />
                <Input id="endDate" name="endDate" type="date" label="End Date" />
              </div>
              <Textarea id="notes" name="notes" label="Notes" placeholder="Any additional notes…" />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? 'Saving…' : 'Add Deal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
