'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SortableTable, type ColumnDef } from '@/components/ui/sortable-table'
import { DetailSheet, DetailField } from '@/components/ui/detail-sheet'
import { ExpenseRowActions } from './expense-row-actions'
import { bulkDeleteExpenses } from '@/app/actions/expenses'
import { formatCurrency, formatDate } from '@/lib/utils'

const categoryLabels: Record<string, string> = {
  equipment: 'Equipment',
  software: 'Software',
  travel: 'Travel',
  marketing: 'Marketing',
  contractor: 'Contractor',
  office: 'Office',
  taxes: 'Taxes',
  other: 'Other',
}

interface ExpenseRow {
  id: string
  date: string
  category: string
  description: string
  vendor: string | null
  amountCents: number
}

interface Props {
  rows: ExpenseRow[]
  currency: string
}

type Key = 'date' | 'category' | 'description' | 'vendor' | 'amount'

export function ExpenseTable({ rows, currency }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [detail, setDetail] = useState<ExpenseRow | null>(null)

  const columns: ColumnDef<ExpenseRow, Key>[] = [
    { key: 'date', label: 'Date', sortable: true, sortValue: (r) => new Date(r.date) },
    { key: 'category', label: 'Category', sortable: true, sortValue: (r) => categoryLabels[r.category] ?? r.category },
    { key: 'description', label: 'Description', sortable: true, sortValue: (r) => r.description.toLowerCase() },
    { key: 'vendor', label: 'Vendor', sortable: true, sortValue: (r) => r.vendor?.toLowerCase() ?? '' },
    { key: 'amount', label: 'Amount', align: 'right', sortable: true, sortValue: (r) => r.amountCents },
  ]

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds)
    startTransition(async () => {
      const result = await bulkDeleteExpenses(ids)
      if (result?.success) {
        toast.success(`Deleted ${ids.length} ${ids.length === 1 ? 'expense' : 'expenses'}`)
        setSelectedIds(new Set())
        setConfirmOpen(false)
      } else {
        toast.error(result?.error ?? 'Could not delete expenses')
      }
    })
  }

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
          <p className="text-sm font-medium text-foreground">{selectedIds.size} selected</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>Clear</Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <SortableTable<ExpenseRow, Key>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        initialSort={{ key: 'date', dir: 'desc' }}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={setDetail}
        renderCell={(r, key) => {
          switch (key) {
            case 'date':
              return <span className="text-muted-foreground">{formatDate(r.date)}</span>
            case 'category':
              return <Badge variant="secondary">{categoryLabels[r.category] || r.category}</Badge>
            case 'description':
              return <span className="text-foreground block max-w-xs truncate">{r.description}</span>
            case 'vendor':
              return <span className="text-muted-foreground">{r.vendor || '—'}</span>
            case 'amount':
              return (
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(r.amountCents, currency)}
                </span>
              )
          }
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'expense' : 'expenses'}?`}
        description="This will permanently remove the selected expenses. You cannot undo this action."
        confirmLabel="Delete"
        destructive
        loading={pending}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {detail && (
        <DetailSheet
          open
          onClose={() => setDetail(null)}
          title={detail.description || categoryLabels[detail.category] || 'Expense'}
          subtitle={`Expense · ${formatDate(detail.date)}`}
          footer={
            <ExpenseRowActions
              labeled
              onDone={() => setDetail(null)}
              id={detail.id}
              category={detail.category}
              amountCents={detail.amountCents}
              description={detail.description}
              vendor={detail.vendor}
              date={detail.date.split('T')[0]}
            />
          }
        >
          <p className="mb-5 text-3xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(detail.amountCents, currency)}
          </p>
          <dl>
            <DetailField label="Category">
              <Badge variant="secondary">{categoryLabels[detail.category] || detail.category}</Badge>
            </DetailField>
            <DetailField label="Description">{detail.description || '—'}</DetailField>
            <DetailField label="Vendor">{detail.vendor || '—'}</DetailField>
            <DetailField label="Date">{formatDate(detail.date)}</DetailField>
          </dl>
        </DetailSheet>
      )}
    </>
  )
}
