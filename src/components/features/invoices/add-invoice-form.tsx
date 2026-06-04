'use client'

import { useState, useEffect, useActionState } from 'react'
import { toast } from 'sonner'
import { Plus, X, Trash2, Pencil } from 'lucide-react'
import { createInvoice, updateInvoice } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useEscapeKey } from '@/hooks/use-escape-key'
import { useDeepLinkOpen } from '@/hooks/use-deep-link-open'
import { currencySymbol } from '@/lib/currencies'

interface LineItem {
  description: string
  quantity: number
  unitPrice: string
}

export interface EditInvoiceData {
  id: string
  clientName: string
  clientEmail: string
  dueDate: string // yyyy-mm-dd
  taxPercent: string | number
  notes: string | null
  items: LineItem[]
}

interface AddInvoiceFormProps {
  currency?: string
  autoOpen?: boolean
  editInvoice?: EditInvoiceData
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

const emptyItem = (): LineItem => ({ description: '', quantity: 1, unitPrice: '' })

export function AddInvoiceForm({ currency = 'USD', autoOpen = false, editInvoice, open: controlledOpen, onOpenChange, hideTrigger = false }: AddInvoiceFormProps = {}) {
  const isEdit = !!editInvoice
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [items, setItems] = useState<LineItem[]>(editInvoice?.items?.length ? editInvoice.items : [emptyItem()])
  const [state, action, pending] = useActionState(isEdit ? updateInvoice : createInvoice, undefined)
  useDeepLinkOpen(autoOpen, () => setOpen(true))

  useEffect(() => {
    if (state?.success) {
      toast.success(isEdit ? 'Invoice updated' : 'Invoice created')
      setOpen(false)
      if (!isEdit) setItems([emptyItem()])
    } else if (state && !state.success && state.error) {
      toast.error(state.error)
    }
  }, [state, isEdit])

  const addItem = () => setItems([...items, emptyItem()])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const subtotal = items.reduce((s, item) => {
    const price = parseFloat(item.unitPrice) || 0
    return s + price * item.quantity
  }, 0)

  useEscapeKey(() => setOpen(false), open)

  return (
    <>
      {!hideTrigger && (
        isEdit ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Edit invoice for ${editInvoice!.clientName}`}
            title="Edit invoice"
            className="inline-flex items-center justify-center rounded-full border border-border p-1.5 text-muted-foreground hover:border-violet-300 hover:text-violet-600 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : (
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        )
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="add-invoice-title" className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 overflow-y-auto py-8">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-lg p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 id="add-invoice-title" className="text-lg font-semibold text-foreground">{isEdit ? 'Edit Invoice' : 'New Invoice'}</h2>
                {!isEdit && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    A polished bill you can send to a client. Use <strong className="font-medium">Revenue</strong> to log money you've already received without invoicing.
                  </p>
                )}
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground shrink-0 ml-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            {state && !state.success && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                {state.error}
              </div>
            )}

            <form
              action={(formData) => {
                formData.set('items', JSON.stringify(items))
                action(formData)
              }}
              className="space-y-4"
            >
              {isEdit && <input type="hidden" name="id" value={editInvoice!.id} />}
              <div className="grid grid-cols-2 gap-3">
                <Input id="clientName" name="clientName" label="Client Name" placeholder="Acme Corp" defaultValue={editInvoice?.clientName} required />
                <Input id="clientEmail" name="clientEmail" type="email" label="Client Email" placeholder="billing@acme.com" defaultValue={editInvoice?.clientEmail} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input id="dueDate" name="dueDate" type="date" label="Due Date" defaultValue={editInvoice?.dueDate} required />
                <Input id="taxPercent" name="taxPercent" type="number" min="0" max="100" step="0.1" label="Tax (%)" defaultValue={editInvoice ? String(editInvoice.taxPercent) : '0'} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Line Items</span>
                  <button type="button" onClick={addItem} className="text-xs text-primary hover:underline">+ Add item</button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-[1fr_60px_90px_32px] gap-2 items-end">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                      />
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price"
                        leadingSlot={currencySymbol(currency)}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        disabled={items.length === 1}
                        className="h-10 flex items-center justify-center text-muted-foreground hover:text-destructive disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <span className="text-sm font-semibold text-foreground">
                  Subtotal: {currencySymbol(currency)}{subtotal.toFixed(2)}
                </span>
              </div>

              <Textarea
                id="notes"
                name="notes"
                label="Notes & Terms (optional)"
                rows={4}
                defaultValue={editInvoice?.notes ?? ''}
                placeholder="Your payment terms, late-fee policy, bank/remit details, or a thank-you note. Shown in the Notes & Terms block on the invoice."
              />

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Invoice')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
