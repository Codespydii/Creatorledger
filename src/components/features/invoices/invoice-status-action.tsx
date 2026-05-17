'use client'

import { updateInvoiceStatus } from '@/app/actions/invoices'

interface InvoiceStatusActionProps {
  id: string
  currentStatus: string
}

const nextActions: Record<string, { label: string; status: string; style: string }[]> = {
  draft: [
    { label: 'Mark Sent', status: 'sent', style: 'border-blue-300 text-blue-700 hover:bg-blue-50' },
  ],
  sent: [
    { label: 'Mark Paid', status: 'paid', style: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' },
    { label: 'Mark Overdue', status: 'overdue', style: 'border-red-300 text-red-700 hover:bg-red-50' },
  ],
  overdue: [
    { label: 'Mark Paid', status: 'paid', style: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' },
  ],
  paid: [],
  cancelled: [],
}

export function InvoiceStatusAction({ id, currentStatus }: InvoiceStatusActionProps) {
  const actions = nextActions[currentStatus] || []
  if (actions.length === 0) return null

  return (
    <div className="flex gap-1.5 flex-wrap justify-end">
      {actions.map(({ label, status, style }) => (
        <button
          key={status}
          onClick={() => updateInvoiceStatus(id, status)}
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${style}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
