'use client'

import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportRow {
  id: string
  date: string
  category: string
  description: string
  vendor: string | null
  amountCents: number
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

export function ExportExpensesButton({ rows, currency = 'USD' }: Props) {
  const handleExport = () => {
    const header = ['Date', 'Category', 'Description', 'Vendor', 'Amount', 'Currency']
    const body = rows.map((r) =>
      [
        r.date.slice(0, 10),
        r.category,
        r.description,
        r.vendor ?? '',
        (r.amountCents / 100).toFixed(2),
        currency,
      ]
        .map(csvCell)
        .join(','),
    )
    const csv = [header.join(','), ...body].join('\r\n')

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-export-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={rows.length === 0} title={rows.length === 0 ? 'No expenses to export' : undefined}>
      <Upload className="h-4 w-4" />
      Export
    </Button>
  )
}
