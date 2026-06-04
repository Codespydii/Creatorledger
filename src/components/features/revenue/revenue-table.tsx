'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SortableTable, type ColumnDef } from '@/components/ui/sortable-table'
import { DetailSheet, DetailField } from '@/components/ui/detail-sheet'
import { RevenueRowActions } from './revenue-row-actions'
import { bulkDeleteRevenueEntries } from '@/app/actions/revenue'
import { formatCurrency, formatDate } from '@/lib/utils'

const sourceLabels: Record<string, string> = {
  adsense: 'AdSense',
  sponsorship: 'Sponsorship',
  brand_deal: 'Sponsorship',
  affiliate: 'Affiliate',
  tiktok_fund: 'TikTok Fund',
  patreon: 'Patreon',
  substack: 'Substack',
  memberships: 'Memberships',
  podcast: 'Podcast',
  merchandise: 'Merch',
  tips: 'Tips',
  other: 'Other',
}

const sourceBadge: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
  adsense: 'success',
  sponsorship: 'default',
  brand_deal: 'default',
  affiliate: 'warning',
  tiktok_fund: 'success',
  patreon: 'warning',
  substack: 'warning',
  memberships: 'default',
  podcast: 'default',
  merchandise: 'secondary',
  tips: 'success',
  other: 'secondary',
}

interface RevenueRow {
  id: string
  date: string
  source: string
  description: string
  platform: string | null
  amountCents: number
  isRefund: boolean
  dealBrandName?: string | null
}

interface Props {
  rows: RevenueRow[]
  currency: string
}

type Key = 'date' | 'source' | 'description' | 'platform' | 'amount'

export function RevenueTable({ rows, currency }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [detail, setDetail] = useState<RevenueRow | null>(null)

  const columns: ColumnDef<RevenueRow, Key>[] = [
    { key: 'date', label: 'Date', sortable: true, sortValue: (r) => new Date(r.date) },
    { key: 'source', label: 'Source', sortable: true, sortValue: (r) => sourceLabels[r.source] ?? r.source },
    { key: 'description', label: 'Description', sortable: true, sortValue: (r) => r.description.toLowerCase() },
    { key: 'platform', label: 'Platform', sortable: true, sortValue: (r) => r.platform?.toLowerCase() ?? '' },
    { key: 'amount', label: 'Amount', align: 'right', sortable: true, sortValue: (r) => r.amountCents },
  ]

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds)
    startTransition(async () => {
      const result = await bulkDeleteRevenueEntries(ids)
      if (result?.success) {
        toast.success(`Deleted ${ids.length} ${ids.length === 1 ? 'entry' : 'entries'}`)
        setSelectedIds(new Set())
        setConfirmOpen(false)
      } else {
        toast.error(result?.error ?? 'Could not delete entries')
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

      <SortableTable<RevenueRow, Key>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        initialSort={{ key: 'date', dir: 'desc' }}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={setDetail}
        rowClassName={(r) => (r.isRefund ? 'bg-red-50/40 dark:bg-red-950/20' : '')}
        renderCell={(r, key) => {
          switch (key) {
            case 'date':
              return <span className="text-muted-foreground">{formatDate(r.date)}</span>
            case 'source':
              return r.isRefund
                ? <Badge variant="destructive">Refund</Badge>
                : <Badge variant={sourceBadge[r.source] || 'secondary'}>{sourceLabels[r.source] || r.source}</Badge>
            case 'description':
              return (
                <span className="text-foreground block max-w-xs truncate">
                  {r.description}
                  {r.dealBrandName && <span className="text-muted-foreground"> · {r.dealBrandName}</span>}
                </span>
              )
            case 'platform':
              return <span className="text-muted-foreground">{r.platform || '—'}</span>
            case 'amount':
              return (
                <span className={`font-semibold ${r.amountCents < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {r.amountCents < 0 ? '−' : ''}{formatCurrency(Math.abs(r.amountCents), currency)}
                </span>
              )
          }
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'entry' : 'entries'}?`}
        description="This will permanently remove the selected revenue entries. You cannot undo this action."
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
          title={detail.description || (detail.isRefund ? 'Refund' : sourceLabels[detail.source] || 'Revenue entry')}
          subtitle={`Revenue entry · ${formatDate(detail.date)}`}
          footer={
            <RevenueRowActions
              labeled
              onDone={() => setDetail(null)}
              id={detail.id}
              source={detail.source}
              amountCents={detail.amountCents}
              description={detail.description}
              platform={detail.platform}
              date={detail.date.split('T')[0]}
              isRefund={detail.isRefund}
            />
          }
        >
          <p className={`mb-5 text-3xl font-bold ${detail.amountCents < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {detail.amountCents < 0 ? '−' : ''}{formatCurrency(Math.abs(detail.amountCents), currency)}
          </p>
          <dl>
            <DetailField label="Type">
              {detail.isRefund
                ? <Badge variant="destructive">Refund</Badge>
                : <Badge variant={sourceBadge[detail.source] || 'secondary'}>{sourceLabels[detail.source] || detail.source}</Badge>}
            </DetailField>
            <DetailField label="Description">{detail.description || '—'}</DetailField>
            <DetailField label="Platform">{detail.platform || '—'}</DetailField>
            <DetailField label="Date">{formatDate(detail.date)}</DetailField>
            {detail.dealBrandName && <DetailField label="Linked brand deal">{detail.dealBrandName}</DetailField>}
          </dl>
        </DetailSheet>
      )}
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
      <p className="text-sm font-medium text-foreground">
        {count} selected
      </p>
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
