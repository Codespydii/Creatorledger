'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2, Download, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SortableTable, type ColumnDef } from '@/components/ui/sortable-table'
import { DetailSheet, DetailField } from '@/components/ui/detail-sheet'
import { InvoiceStatusAction } from './invoice-status-action'
import { InvoiceActionsMenu } from './invoice-actions-menu'
import { AddInvoiceForm } from './add-invoice-form'
import { bulkDeleteInvoices } from '@/app/actions/invoices'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  draft: 'secondary',
  sent: 'default',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'secondary',
}

const statusOrder: Record<string, number> = {
  overdue: 0, sent: 1, draft: 2, paid: 3, cancelled: 4,
}

interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: string
}

interface InvoiceRow {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  issuedDate: string
  dueDate: string
  status: string
  totalCents: number
  publicId: string | null
  paymentLinkUrl: string | null
  notes: string | null
  taxPercent: number
  items: InvoiceLineItem[]
}

interface Props {
  rows: InvoiceRow[]
  currency: string
}

type Key = 'invoiceNumber' | 'client' | 'issued' | 'due' | 'status' | 'total' | 'actions'

export function InvoiceTable({ rows, currency }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [detail, setDetail] = useState<InvoiceRow | null>(null)
  const [editTarget, setEditTarget] = useState<InvoiceRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InvoiceRow | null>(null)
  const [deletePending, startDelete] = useTransition()

  const columns: ColumnDef<InvoiceRow, Key>[] = [
    { key: 'invoiceNumber', label: 'Invoice #', sortable: true, sortValue: (r) => r.invoiceNumber, className: 'pr-4 whitespace-nowrap' },
    { key: 'client', label: 'Client', sortable: true, sortValue: (r) => r.clientName.toLowerCase(), className: 'pr-4' },
    { key: 'issued', label: 'Issued', sortable: true, sortValue: (r) => new Date(r.issuedDate), className: 'pr-4 whitespace-nowrap' },
    { key: 'due', label: 'Due', sortable: true, sortValue: (r) => new Date(r.dueDate), className: 'pr-4 whitespace-nowrap' },
    { key: 'status', label: 'Status', sortable: true, sortValue: (r) => statusOrder[r.status] ?? 99, className: 'pr-4' },
    { key: 'total', label: 'Total', align: 'right', sortable: true, sortValue: (r) => r.totalCents, className: 'pr-4 whitespace-nowrap' },
    { key: 'actions', label: '', align: 'right' },
  ]

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds)
    startTransition(async () => {
      const result = await bulkDeleteInvoices(ids)
      if (result?.success) {
        toast.success(`Deleted ${ids.length} ${ids.length === 1 ? 'invoice' : 'invoices'}`)
        setSelectedIds(new Set())
        setConfirmOpen(false)
      } else {
        toast.error(result?.error ?? 'Could not delete invoices')
      }
    })
  }

  const handleSingleDelete = () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    startDelete(async () => {
      const result = await bulkDeleteInvoices([id])
      if (result?.success) {
        toast.success('Invoice deleted')
        setDeleteTarget(null)
      } else {
        toast.error(result?.error ?? 'Could not delete invoice')
      }
    })
  }

  return (
    <>
      <BulkBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setConfirmOpen(true)}
      />

      <SortableTable<InvoiceRow, Key>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        initialSort={{ key: 'issued', dir: 'desc' }}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={setDetail}
        renderCell={(r, key) => {
          switch (key) {
            case 'invoiceNumber':
              return <span className="font-mono text-xs text-muted-foreground">{r.invoiceNumber}</span>
            case 'client':
              return (
                <div className="max-w-[180px]">
                  <p className="font-medium text-foreground truncate">{r.clientName}</p>
                  <p className="text-xs text-muted-foreground truncate" title={r.clientEmail}>{r.clientEmail}</p>
                </div>
              )
            case 'issued':
              return <span className="text-muted-foreground">{formatDate(r.issuedDate)}</span>
            case 'due':
              return <span className="text-muted-foreground">{formatDate(r.dueDate)}</span>
            case 'status':
              return <Badge variant={statusVariant[r.status] || 'secondary'}>{r.status}</Badge>
            case 'total':
              return <span className="font-semibold text-foreground">{formatCurrency(r.totalCents, currency)}</span>
            case 'actions':
              return (
                <div className="flex items-center justify-end gap-2">
                  {/* Primary status control inline; everything else under the ⋯ menu */}
                  <InvoiceStatusAction id={r.id} currentStatus={r.status} />
                  <InvoiceActionsMenu invoice={r} />
                </div>
              )
          }
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'invoice' : 'invoices'}?`}
        description="This will permanently remove the selected invoices and their line items. You cannot undo this action."
        confirmLabel="Delete"
        destructive
        loading={pending}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {detail && (() => {
        const subtotalCents = detail.items.reduce((s, it) => s + Math.round(parseFloat(it.unitPrice || '0') * 100) * it.quantity, 0)
        const taxCents = Math.round(subtotalCents * (detail.taxPercent / 100))
        return (
          <DetailSheet
            open
            onClose={() => setDetail(null)}
            title={detail.invoiceNumber}
            subtitle={`${detail.clientName} · ${formatCurrency(detail.totalCents, currency)}`}
            footer={
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-destructive hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => { setDeleteTarget(detail); setDetail(null) }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => { setEditTarget(detail); setDetail(null) }}>
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                  </Button>
                </div>
                <a
                  href={`/api/invoices/${detail.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Download className="h-4 w-4" aria-hidden="true" /> Download PDF
                </a>
              </div>
            }
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <Badge variant={statusVariant[detail.status] || 'secondary'}>{detail.status}</Badge>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(detail.totalCents, currency)}</p>
            </div>

            <dl>
              <DetailField label="Client">
                {detail.clientName}
                <span className="block text-xs text-muted-foreground">{detail.clientEmail}</span>
              </DetailField>
              <DetailField label="Issued">{formatDate(detail.issuedDate)}</DetailField>
              <DetailField label="Due">{formatDate(detail.dueDate)}</DetailField>
              <DetailField label="Currency">{currency}</DetailField>
            </dl>

            <div className="mt-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Line items</p>
              <div className="divide-y divide-border rounded-lg border border-border">
                {detail.items.map((it, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 px-3 py-2 text-sm">
                    <span className="text-foreground">
                      {it.description || '—'}
                      <span className="block text-xs text-muted-foreground">
                        {it.quantity} × {formatCurrency(Math.round(parseFloat(it.unitPrice || '0') * 100), currency)}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium text-foreground">
                      {formatCurrency(Math.round(parseFloat(it.unitPrice || '0') * 100) * it.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>{formatCurrency(subtotalCents, currency)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax ({Number(detail.taxPercent)}%)</span><span>{formatCurrency(taxCents, currency)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
                  <span>Total</span><span>{formatCurrency(detail.totalCents, currency)}</span>
                </div>
              </div>
            </div>

            {detail.notes && (
              <div className="mt-5">
                <p className="mb-1.5 text-xs uppercase tracking-wide text-muted-foreground">Notes &amp; Terms</p>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{detail.notes}</p>
              </div>
            )}
          </DetailSheet>
        )
      })()}

      {/* Edit invoice (opened from the detail modal) */}
      {editTarget && (
        <AddInvoiceForm
          currency={currency}
          hideTrigger
          open
          onOpenChange={(o) => { if (!o) setEditTarget(null) }}
          editInvoice={{
            id: editTarget.id,
            clientName: editTarget.clientName,
            clientEmail: editTarget.clientEmail,
            dueDate: editTarget.dueDate.slice(0, 10),
            taxPercent: editTarget.taxPercent,
            notes: editTarget.notes,
            items: editTarget.items,
          }}
        />
      )}

      {/* Delete invoice (opened from the detail modal) */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this invoice?"
        description="This permanently removes the invoice and its line items. You cannot undo this action."
        confirmLabel="Delete"
        destructive
        loading={deletePending}
        onConfirm={handleSingleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}

interface BulkBarProps {
  count: number
  onClear: () => void
  onDelete: () => void
}

function BulkBar({ count, onClear, onDelete }: BulkBarProps) {
  if (count === 0) return null
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
      <p className="text-sm font-medium text-foreground">{count} selected</p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </div>
  )
}
