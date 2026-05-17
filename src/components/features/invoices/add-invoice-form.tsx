'use client'

import { useState, useEffect, useActionState } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import { createInvoice } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useEscapeKey } from '@/hooks/use-escape-key'
import { currencySymbol } from '@/lib/currencies'

interface LineItem {
  description: string
  quantity: number
  unitPrice: string
}

interface AddInvoiceFormProps {
  currency?: string
}

export function AddInvoiceForm({ currency = 'USD' }: AddInvoiceFormProps = {}) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<LineItem[]>([{ description: '', quantity: 1, unitPrice: '' }])
  const [state, action, pending] = useActionState(createInvoice, undefined)

  useEffect(() => {
    if (state?.success) {
      setOpen(false)
      setItems([{ description: '', quantity: 1, unitPrice: '' }])
    }
  }, [state])

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: '' }])
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
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Invoice
      </Button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="add-invoice-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-lg p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 id="add-invoice-title" className="text-lg font-semibold text-foreground">New Invoice</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A polished bill you can send to a client. Use <strong className="font-medium">Revenue</strong> to log money you&apos;ve already received without invoicing.
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

            <form
              action={(formData) => {
                formData.set('items', JSON.stringify(items))
                action(formData)
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <Input id="clientName" name="clientName" label="Client Name" placeholder="Acme Corp" required />
                <Input id="clientEmail" name="clientEmail" type="email" label="Client Email" placeholder="billing@acme.com" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input id="dueDate" name="dueDate" type="date" label="Due Date" required />
                <Input id="taxPercent" name="taxPercent" type="number" min="0" max="100" step="0.1" label="Tax (%)" defaultValue="0" />
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

              <Textarea id="notes" name="notes" label="Notes (optional)" placeholder="Payment terms, bank details…" />

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? 'Creating…' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
