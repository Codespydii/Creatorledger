interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPriceCents: number
  totalCents: number
}

interface InvoiceData {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientCompany?: string | null
  clientAddress?: string | null
  status: string
  subtotalCents: number
  taxCents: number
  taxPercent: number | string | { toString(): string } // Decimal-like
  totalCents: number
  dueDate: Date | string
  issuedDate: Date | string
  paidDate: Date | string | null
  notes: string | null
  paymentLinkUrl: string | null
  items: InvoiceItem[]
  user: {
    name: string
    channelName: string | null
    email: string
    defaultCurrency: string
    businessAddress?: string | null
    ein?: string | null
    website?: string | null
  }
}

const statusLabel: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
}

function toISO(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString()
}

function fmtDate(d: Date | string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(toISO(d)))
}

// 2-decimal amounts, matching the PDF.
function money(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100)
}

function netTerms(issued: Date | string, due: Date | string): string {
  const days = Math.round((new Date(toISO(due)).getTime() - new Date(toISO(issued)).getTime()) / 86_400_000)
  return days > 0 ? `Net ${days}` : 'Due on receipt'
}

export function InvoiceDocument({ invoice }: { invoice: InvoiceData }) {
  const currency = invoice.user.defaultCurrency ?? 'USD'
  const storedPct = Number(invoice.taxPercent)
  const taxRate = storedPct > 0
    ? storedPct.toFixed(storedPct % 1 === 0 ? 0 : 1)
    : invoice.subtotalCents > 0
      ? ((invoice.taxCents / invoice.subtotalCents) * 100).toFixed(invoice.taxCents === 0 ? 0 : 1)
      : '0'
  const terms = netTerms(invoice.issuedDate, invoice.dueDate)

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Top accent bar */}
      <div className="h-3 bg-[#7c3aed]" />

      <div className="flex flex-col sm:flex-row">
        {/* ── Sidebar: FROM / BILL TO / brand ── */}
        <aside className="flex w-full flex-col bg-[#f5f3ff] p-6 sm:w-56 sm:shrink-0">
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7c3aed]">From</p>
            <p className="text-[15px] font-bold leading-tight text-gray-900">{invoice.user.name}</p>
            {invoice.user.channelName && <p className="mt-0.5 text-xs leading-snug text-gray-500">{invoice.user.channelName}</p>}
            {invoice.user.businessAddress && <p className="mt-0.5 text-xs leading-snug text-gray-500">{invoice.user.businessAddress}</p>}
            {invoice.user.ein && <p className="mt-0.5 text-xs leading-snug text-gray-500">EIN: {invoice.user.ein}</p>}
            <p className="mt-0.5 text-xs leading-snug text-gray-500">{invoice.user.email}</p>
            {invoice.user.website && <p className="mt-0.5 text-xs leading-snug text-gray-500">{invoice.user.website}</p>}
          </div>

          <div className="mt-6">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7c3aed]">Bill To</p>
            <p className="text-[15px] font-bold leading-tight text-gray-900">{invoice.clientName}</p>
            {invoice.clientCompany && <p className="mt-0.5 text-xs leading-snug text-gray-500">{invoice.clientCompany}</p>}
            {invoice.clientAddress && <p className="mt-0.5 text-xs leading-snug text-gray-500">{invoice.clientAddress}</p>}
            {invoice.clientEmail && <p className="mt-0.5 text-xs leading-snug text-gray-500">{invoice.clientEmail}</p>}
          </div>

          {/* Brand mark — real product assets */}
          <div className="mt-8 sm:mt-auto sm:pt-8">
            <div className="mb-2 h-px w-full bg-[#7c3aed]" />
            <div className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/caelo-icon.png" alt="" className="h-4 w-4" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/caelo-logo.png" alt="Caelo" className="h-3.5 w-auto" />
            </div>
            <p className="mt-1 text-[9px] text-gray-400">Smart Invoicing for Creators</p>
          </div>
        </aside>

        {/* ── Main column ── */}
        <main className="flex-1 p-6 sm:p-8">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-wide text-gray-900">INVOICE</h1>
              <p className="mt-1 font-mono text-xs text-gray-500">{invoice.invoiceNumber}</p>
            </div>
            <div className="space-y-1 text-right">
              <MetaRow label="Invoice Date" value={fmtDate(invoice.issuedDate)} />
              <MetaRow label="Due Date" value={fmtDate(invoice.dueDate)} />
              <MetaRow label="Terms" value={terms} />
              <MetaRow label="Currency" value={currency} />
              <MetaRow label="Status" value={statusLabel[invoice.status] ?? invoice.status} />
            </div>
          </div>

          {/* Line items */}
          <table className="w-full">
            <thead>
              <tr className="bg-[#7c3aed] text-white">
                <th className="rounded-l px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider">Description</th>
                <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider">Qty</th>
                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider">Rate</th>
                <th className="rounded-r px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={item.id} className={i % 2 === 1 ? 'bg-[#faf5ff]' : 'bg-white'}>
                  <td className="px-3 py-2.5 text-sm text-gray-800">{item.description}</td>
                  <td className="px-3 py-2.5 text-center text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-3 py-2.5 text-right text-sm text-gray-500">{money(item.unitPriceCents, currency)}</td>
                  <td className="px-3 py-2.5 text-right text-sm font-semibold text-gray-900">{money(item.totalCents, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-5 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-1 text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="text-gray-900">{money(invoice.subtotalCents, currency)}</span>
              </div>
              <div className="flex justify-between py-1 text-sm text-gray-600">
                <span>Sales Tax ({taxRate}%)</span>
                <span className="text-gray-900">{money(invoice.taxCents, currency)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between rounded bg-[#7c3aed] px-3 py-2 text-white">
                <span className="text-[15px] font-bold">Total Due</span>
                <span className="text-base font-bold">{money(invoice.totalCents, currency)}</span>
              </div>
              {invoice.paidDate && (
                <div className="mt-1.5 flex justify-between text-sm font-medium text-emerald-600">
                  <span>Paid on</span>
                  <span>{fmtDate(invoice.paidDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment instructions */}
          <div className="mt-6 rounded-lg bg-[#ede9fe] p-4">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7c3aed]">Payment Instructions</p>
            <p className="text-sm leading-relaxed text-gray-800">
              Payment is due within {terms === 'Due on receipt' ? '0' : terms.replace('Net ', '')} days of the invoice date ({terms}).
            </p>
            {invoice.paymentLinkUrl && invoice.status !== 'paid' ? (
              <a
                href={invoice.paymentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded-lg bg-[#7c3aed] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
              >
                Pay {money(invoice.totalCents, currency)} now →
              </a>
            ) : (
              <p className="mt-1 text-sm leading-relaxed text-gray-800">
                Make payment payable to <span className="font-semibold">{invoice.user.name}</span>
                {invoice.user.email ? ` · ${invoice.user.email}` : ''}.
              </p>
            )}
          </div>

          {/* Notes & Terms — written by the creator */}
          {invoice.notes && (
            <div className="mt-5">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Notes &amp; Terms</p>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-gray-500">{invoice.notes}</p>
            </div>
          )}
        </main>
      </div>

      {/* Bottom accent bar */}
      <div className="h-3 bg-[#7c3aed]" />
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-end gap-3">
      <span className="text-[10px] uppercase tracking-wide text-gray-400">{label}</span>
      <span className="w-28 text-sm font-bold text-gray-900">{value}</span>
    </div>
  )
}
