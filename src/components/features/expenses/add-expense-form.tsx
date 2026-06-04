'use client'

import { useState, useEffect, useActionState, useRef } from 'react'
import { toast } from 'sonner'
import { Plus, X, ScanLine, Loader2, Sparkles } from 'lucide-react'
import { createExpense } from '@/app/actions/expenses'
import { scanReceiptAction } from '@/app/actions/receipt-scan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useEscapeKey } from '@/hooks/use-escape-key'
import { useDeepLinkOpen } from '@/hooks/use-deep-link-open'
import { currencySymbol } from '@/lib/currencies'

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

const today = () => new Date().toISOString().split('T')[0]

interface FormValues {
  category: string
  amount: string
  description: string
  vendor: string
  date: string
}

const emptyValues = (): FormValues => ({
  category: '',
  amount: '',
  description: '',
  vendor: '',
  date: today(),
})

interface Props {
  scanEnabled?: boolean
  currency?: string
  autoOpen?: boolean
}

export function AddExpenseForm({ scanEnabled = true, currency = 'USD', autoOpen = false }: Props) {
  const [open, setOpen] = useState(false)
  useDeepLinkOpen(autoOpen, () => setOpen(true))
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanInfo, setScanInfo] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [state, action, pending] = useActionState(createExpense, undefined)

  useEffect(() => {
    if (state?.success) {
      toast.success('Expense added')
      setOpen(false)
      setValues(emptyValues())
      setScanInfo(null)
      setScanError(null)
    } else if (state && !state.success && state.error) {
      toast.error(state.error)
    }
  }, [state])

  const handleClose = () => {
    setOpen(false)
    setValues(emptyValues())
    setScanInfo(null)
    setScanError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  useEscapeKey(handleClose, open)

  const handleScan = async (file: File) => {
    setScanning(true)
    setScanError(null)
    setScanInfo(null)
    const fd = new FormData()
    fd.append('receipt', file)
    const result = await scanReceiptAction(fd)
    setScanning(false)
    if (fileRef.current) fileRef.current.value = ''

    if (!result.success) {
      setScanError(result.error)
      return
    }

    const d = result.data
    setValues({
      category: d.category || 'other',
      amount: d.amount != null ? d.amount.toFixed(2) : '',
      description: d.description || '',
      vendor: d.vendor || '',
      date: d.date || today(),
    })
    const confidenceText =
      d.confidence === 'high'
        ? 'High confidence'
        : d.confidence === 'medium'
        ? 'Medium confidence'
        : 'Low confidence — double-check fields'
    setScanInfo(`Receipt scanned. ${confidenceText}.`)
  }

  const setField = (key: keyof FormValues, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Expense
      </Button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="add-expense-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 id="add-expense-title" className="text-lg font-semibold text-foreground">Log Expense</h2>
              <button onClick={handleClose} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {scanEnabled && (
              <div className="mb-5">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.currentTarget.files?.[0]
                    if (f) handleScan(f)
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={scanning}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-60 disabled:cursor-wait"
                >
                  {scanning ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Scanning receipt…</>
                  ) : (
                    <><ScanLine className="h-4 w-4" /> Scan a receipt (auto-fill)</>
                  )}
                </button>
                {scanInfo && (
                  <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{scanInfo}</span>
                  </div>
                )}
                {scanError && (
                  <div className="mt-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                    {scanError}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">or fill manually</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </div>
            )}

            {state && !state.success && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                {state.error}
              </div>
            )}

            <form action={action} className="space-y-4">
              <Select
                id="category"
                name="category"
                label="Category"
                options={categoryOptions}
                placeholder="Select category"
                value={values.category}
                onChange={(e) => setField('category', e.currentTarget.value)}
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
                value={values.amount}
                onChange={(e) => setField('amount', e.currentTarget.value)}
                required
              />
              <Input
                id="description"
                name="description"
                type="text"
                label="Description"
                placeholder="e.g. Camera lens"
                value={values.description}
                onChange={(e) => setField('description', e.currentTarget.value)}
                required
              />
              <Input
                id="vendor"
                name="vendor"
                type="text"
                label="Vendor (optional)"
                placeholder="e.g. B&H Photo"
                value={values.vendor}
                onChange={(e) => setField('vendor', e.currentTarget.value)}
              />
              <Input
                id="date"
                name="date"
                type="date"
                label="Date"
                value={values.date}
                onChange={(e) => setField('date', e.currentTarget.value)}
                required
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? 'Saving…' : 'Log Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
