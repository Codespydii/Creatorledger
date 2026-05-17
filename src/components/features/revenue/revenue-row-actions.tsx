'use client'

import { useState, useTransition, useActionState, useEffect } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { updateRevenueEntry, deleteRevenueEntry } from '@/app/actions/revenue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useEscapeKey } from '@/hooks/use-escape-key'

const sourceOptions = [
  { value: 'adsense', label: 'AdSense' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'brand_deal', label: 'Brand Deal' },
  { value: 'merchandise', label: 'Merchandise' },
  { value: 'other', label: 'Other' },
]

interface Props {
  id: string
  source: string
  amountCents: number
  description: string
  platform: string | null
  date: string
}

export function RevenueRowActions({ id, source, amountCents, description, platform, date }: Props) {
  const [modal, setModal] = useState<'edit' | 'delete' | null>(null)
  const [editState, editAction, editPending] = useActionState(updateRevenueEntry, undefined)
  const [deletePending, startDelete] = useTransition()

  useEffect(() => {
    if (editState?.success) setModal(null)
  }, [editState])

  const handleDelete = () => {
    startDelete(async () => {
      await deleteRevenueEntry(id)
      setModal(null)
    })
  }

  useEscapeKey(() => setModal(null), modal !== null && !deletePending && !editPending)

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => setModal('edit')}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setModal('delete')}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Edit modal */}
      {modal === 'edit' && (
        <div role="dialog" aria-modal="true" aria-labelledby="edit-revenue-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 id="edit-revenue-title" className="text-lg font-semibold text-foreground">Edit Revenue Entry</h2>
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
              <Select id="source" name="source" label="Revenue Source" options={sourceOptions} defaultValue={source} required />
              <Input
                id="amount" name="amount" type="number" step="0.01" min="0.01"
                label="Amount (USD)" defaultValue={(amountCents / 100).toFixed(2)} required
              />
              <Input id="description" name="description" label="Description" defaultValue={description} required />
              <Input id="platform" name="platform" label="Platform (optional)" defaultValue={platform ?? ''} placeholder="YouTube, Instagram…" />
              <Input id="date" name="date" type="date" label="Date" defaultValue={date} required />
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
        <div role="dialog" aria-modal="true" aria-labelledby="delete-revenue-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-xl p-6 space-y-4">
            <h3 id="delete-revenue-title" className="text-base font-semibold text-foreground">Delete this entry?</h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{description}</span> will be permanently removed.
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
