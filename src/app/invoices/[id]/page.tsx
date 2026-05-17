import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PrintButton } from './print-button'

interface Props {
  params: Promise<{ id: string }>
}

const statusLabel: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
}

export default async function InvoicePrintPage({ params }: Props) {
  const { id } = await params
  const session = await verifySession()

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { items: true, user: true },
  })

  if (!invoice || invoice.userId !== session.userId) notFound()

  const currency = invoice.user.defaultCurrency ?? 'USD'
  const taxRate = invoice.subtotalCents > 0
    ? ((invoice.taxCents / invoice.subtotalCents) * 100).toFixed(1)
    : '0'

  return (
    <>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="min-h-screen bg-white p-8">
        {/* Toolbar — hidden when printing */}
        <div className="print:hidden mb-8 flex items-center justify-between">
          <a href="/invoices" className="text-sm text-violet-600 hover:underline">← Back to Invoices</a>
          <PrintButton />
        </div>

        {/* Invoice document */}
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="mt-1 text-sm text-gray-500 font-mono">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">{invoice.user.name}</p>
              {invoice.user.channelName && (
                <p className="text-sm text-gray-500">{invoice.user.channelName}</p>
              )}
              <p className="text-sm text-gray-500">{invoice.user.email}</p>
            </div>
          </div>

          {/* Bill To / Dates */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Bill To</p>
              <p className="font-semibold text-gray-900">{invoice.clientName}</p>
              <p className="text-sm text-gray-500">{invoice.clientEmail}</p>
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <div className="flex justify-end gap-8">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Issue Date</span>
                  <span className="text-sm text-gray-700">{formatDate(invoice.issuedDate.toISOString())}</span>
                </div>
                <div className="flex justify-end gap-8">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Due Date</span>
                  <span className="text-sm text-gray-700">{formatDate(invoice.dueDate.toISOString())}</span>
                </div>
                <div className="flex justify-end gap-8 mt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Status</span>
                  <span className="text-sm font-medium text-gray-900">{statusLabel[invoice.status] ?? invoice.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Description</th>
                <th className="pb-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 w-16">Qty</th>
                <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 w-28">Unit Price</th>
                <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-700">{item.description}</td>
                  <td className="py-3 text-center text-sm text-gray-700">{item.quantity}</td>
                  <td className="py-3 text-right text-sm text-gray-700">{formatCurrency(item.unitPriceCents, currency)}</td>
                  <td className="py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(item.totalCents, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-10">
            <div className="w-56 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotalCents, currency)}</span>
              </div>
              {invoice.taxCents > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax ({taxRate}%)</span>
                  <span>{formatCurrency(invoice.taxCents, currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(invoice.totalCents, currency)}</span>
              </div>
              {invoice.paidDate && (
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span>Paid on</span>
                  <span>{formatDate(invoice.paidDate.toISOString())}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pay online link */}
          {invoice.paymentLinkUrl && invoice.status !== 'paid' && (
            <div className="border-t border-gray-200 pt-6 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Pay Online</p>
              <a
                href={invoice.paymentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
              >
                Pay {formatCurrency(invoice.totalCents, currency)} now →
              </a>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t border-gray-200 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
