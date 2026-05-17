'use client'

import { useState, useTransition, useActionState, useEffect } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { updateDeal, deleteDeal } from '@/app/actions/deals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useEscapeKey } from '@/hooks/use-escape-key'

const stageOptions = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'contracted', label: 'Contracted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'lost', label: 'Lost' },
]

interface Props {
  id: string
  brandName: string
  contactName: string | null
  contactEmail: string | null
  stage: string
  valueCents: number
  deliverables: string | null
  startDate: string | null
  endDate: string | null
  notes: string | null
}

export function DealRowActions(props: Props) {
  const { id, brandName, contactName, contactEmail, stage, valueCents, deliverables, startDate, endDate, notes } = props
  const [modal, setModal] = useState<'edit' | 'delete' | null>(null)
  const [editState, editAction, editPending] = useActionState(updateDeal, undefined)
  const [deletePending, startDelete] = useTransition()

  useEffect(() => {
    if (editState?.success) setModal(null)
  }, [editState])

  const handleDelete = () => {
    startDelete(async () => {
      await deleteDeal(id)
      setModal(null)
    })
  }

  useEscapeKey(() => setModal(null), modal !== null && !deletePending && !editPending)

  return (
    <>
      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
        <button
          onClick={() => setModal('edit')}
          className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Pencil className="h-3 w-3" /> Edit
        </button>
        <button
          onClick={() => setModal('delete')}
          className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3 w-3" /> Delete
        </button>
      </div>

      {/* Edit modal */}
      {modal === 'edit' && (
        <div role="dialog" aria-modal="true" aria-labelledby="edit-deal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 id="edit-deal-title" className="text-lg font-semibold text-foreground">Edit Deal</h2>
              <button onClick={() => setModal(null)} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            {editState && !editState.success && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {editState.error}
              </div>
            )}
            <form action={editAction} className="space-y-4">
              <input type="hidden" name="id" value={id} />
              <Input id="brandName" name="brandName" label="Brand Name" defaultValue={brandName} required />
              <div className="grid grid-cols-2 gap-3">
                <Input id="contactName" name="contactName" label="Contact Name" defaultValue={contactName ?? ''} />
                <Input id="contactEmail" name="contactEmail" type="email" label="Contact Email" defaultValue={contactEmail ?? ''} />
              </div>
              <Select id="stage" name="stage" label="Stage" options={stageOptions} defaultValue={stage} required />
              <Input id="value" name="value" type="number" step="0.01" min="0" label="Deal Value (USD)" defaultValue={(valueCents / 100).toFixed(2)} required />
              <Textarea id="deliverables" name="deliverables" label="Deliverables" defaultValue={deliverables ?? ''} />
              <div className="grid grid-cols-2 gap-3">
                <Input id="startDate" name="startDate" type="date" label="Start Date" defaultValue={startDate ?? ''} />
                <Input id="endDate" name="endDate" type="date" label="End Date" defaultValue={endDate ?? ''} />
              </div>
              <Textarea id="notes" name="notes" label="Notes" defaultValue={notes ?? ''} />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setModal(null)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={editPending}>{editPending ? 'Saving…' : 'Save Changes'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {modal === 'delete' && (
        <div role="dialog" aria-modal="true" aria-labelledby="delete-deal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-xl p-6 space-y-4">
            <h3 id="delete-deal-title" className="text-base font-semibold text-foreground">Delete this deal?</h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{brandName}</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)} disabled={deletePending}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deletePending}>
                {deletePending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
