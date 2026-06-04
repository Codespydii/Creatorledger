'use client'

import { Upload } from 'lucide-react'

interface Row {
  month: string
  revenue: number
  expenses: number
  profit: number
  margin: string
}

export function ExportButton({ rows, period }: { rows: Row[]; period: string }) {
  const download = () => {
    const headers = ['Month', 'Revenue (USD)', 'Expenses (USD)', 'Net Profit (USD)', 'Margin (%)']
    const lines = rows.map((r) => [
      r.month,
      (r.revenue / 100).toFixed(2),
      (r.expenses / 100).toFixed(2),
      (r.profit / 100).toFixed(2),
      r.margin,
    ])
    const csv = [headers, ...lines].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `creator-ledger-report-${period}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={download}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
    >
      <Upload className="h-4 w-4" />
      Export CSV
    </button>
  )
}
