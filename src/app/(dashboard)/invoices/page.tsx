import { FileText } from 'lucide-react'
import { Topbar } from '@/components/shared/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddInvoiceForm } from '@/components/features/invoices/add-invoice-form'
import { InvoiceTable } from '@/components/features/invoices/invoice-table'
import { EmptyState } from '@/components/shared/empty-state'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

export default async function InvoicesPage() {
  const session = await verifySession()

  const [user, invoices] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { defaultCurrency: true } }),
    db.invoice.findMany({
      where: { userId: session.userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])
  const currency = user?.defaultCurrency ?? 'USD'

  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.totalCents, 0)
  const totalPending = invoices.filter((i) => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + i.totalCents, 0)

  const rows = invoices.map((i) => ({
    id: i.id,
    invoiceNumber: i.invoiceNumber,
    clientName: i.clientName,
    clientEmail: i.clientEmail,
    issuedDate: i.issuedDate.toISOString(),
    dueDate: i.dueDate.toISOString(),
    status: i.status,
    totalCents: i.totalCents,
    publicId: i.publicId,
    paymentLinkUrl: i.paymentLinkUrl,
    notes: i.notes,
    taxPercent: Number(i.taxPercent),
    items: i.items.map((it) => ({
      description: it.description,
      quantity: it.quantity,
      unitPrice: (it.unitPriceCents / 100).toFixed(2),
    })),
  }))

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Invoices" subtitle="Create and manage client invoices" />
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div data-tour="invoices" className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaid, currency)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(totalPending, currency)}</p>
            </div>
          </div>
          <AddInvoiceForm currency={currency} autoOpen />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {rows.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No invoices yet"
                description="Send a polished invoice in under a minute. Includes a hosted Stripe pay link and PDF download for your client."
                action={<AddInvoiceForm currency={currency} />}
              />
            ) : (
              <InvoiceTable rows={rows} currency={currency} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
