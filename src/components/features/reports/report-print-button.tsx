'use client'

import { Download } from 'lucide-react'

export function ReportPrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-violet-700 transition-colors"
    >
      <Download className="h-4 w-4" />
      Save as PDF
    </button>
  )
}
