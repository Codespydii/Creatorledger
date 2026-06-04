'use client'

import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportRow {
  id: string
  date: string
  source: string
  description: string
  platform: string | null
  amountCents: number
  isRefund: boolean
  dealBrandName: string | null
}

interface Props {
  rows: ExportRow[]
  currency?: string
}

// RFC-4180-ish escaping: wrap in quotes if the cell has a comma, quote, or newline.
function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function ExportRevenueButton({ rows, currency = 'USD' }: Props) {
  const handleExport = () => {
    const header = ['Date', 'Source', 'Description', 'Platform', 'Amount', 'Currency', 'Refund', 'Brand Deal']
    const body = rows.map((r) =>
      [
        r.date.slice(0, 10),
        r.source,
        r.description,
        r.platform ?? '',
        (r.amountCents / 100).toFixed(2),
        currency,
        r.isRefund ? 'Yes' : 'No',
        r.dealBrandName ?? '',
      ]
        .map(csvCell)
        .join(','),
    )
    const csv = [header.join(','), ...body].join('\r\n')

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-export-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={rows.length === 0} title={rows.length === 0 ? 'No revenue to export' : undefined}>
      <Upload className="h-4 w-4" />
      Export
    </Button>
  )
}
