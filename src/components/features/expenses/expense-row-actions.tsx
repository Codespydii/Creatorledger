'use client'

import { useState, useTransition, useActionState, useEffect } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { updateExpense, deleteExpense } from '@/app/actions/expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useEscapeKey } from '@/hooks/use-escape-key'

const categoryOptions = [
  { value: 'equipment', label: 'Equipment' },
  { value: 'software', label: 'Software' },
  { value: 'travel', label: 'Travel' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'office', label: 'Office' },
  { value: 'taxes', label: 'Taxes' },
  { value: 'other', label: 'Other' },
]

interface Props {
  id: string
  category: string
  amountCents: number
  description: string
  vendor: string | null
  date: string
}

export function ExpenseRowActions({ id, category, amountCents, description, vendor, date }: Props) {
  const [modal, setModal] = useState<'edit' | 'delete' | null>(null)
  const [editState, editAction, editPending] = useActionState(updateExpense, undefined)
  const [deletePending, startDelete] = useTransition()

  useEffect(() => {
    if (editState?.success) setModal(null)
  }, [editState])

  const handleDelete = () => {
    startDelete(async () => {
      await deleteExpense(id)
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
        <div role="dialog" aria-modal="true" aria-labelledby="edit-expense-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 id="edit-expense-title" className="text-lg font-semibold text-foreground">Edit Expense</h2>
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
              <Select id="category" name="category" label="Category" options={categoryOptions} defaultValue={category} required />
              <Input
                id="amount" name="amount" type="number" step="0.01" min="0.01"
                label="Amount (USD)" defaultValue={(amountCents / 100).toFixed(2)} required
              />
              <Input id="description" name="description" label="Description" defaultValue={description} required />
              <Input id="vendor" name="vendor" label="Vendor (optional)" defaultValue={vendor ?? ''} />
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
        <div role="dialog" aria-modal="true" aria-labelledby="delete-expense-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-xl p-6 space-y-4">
            <h3 id="delete-expense-title" className="text-base font-semibold text-foreground">Delete this expense?</h3>
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
