import Link from 'next/link'
import { Download } from 'lucide-react'
import { Topbar } from '@/components/shared/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddInvoiceForm } from '@/components/features/invoices/add-invoice-form'
import { InvoiceStatusAction } from '@/components/features/invoices/invoice-status-action'
import { PayLinkButton } from '@/components/features/invoices/pay-link-button'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  draft: 'secondary',
  sent: 'default',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'secondary',
}

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

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Invoices" subtitle="Create and manage client invoices" />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid, currency)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending, currency)}</p>
            </div>
          </div>
          <AddInvoiceForm currency={currency} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {invoices.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No invoices yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left font-medium text-muted-foreground">Invoice #</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">Client</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">Issued</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">Due</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="pb-3 text-right font-medium text-muted-foreground">Total</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-3 font-mono text-xs text-muted-foreground">{inv.invoiceNumber}</td>
                        <td className="py-3">
                          <p className="font-medium text-foreground">{inv.clientName}</p>
                          <p className="text-xs text-muted-foreground">{inv.clientEmail}</p>
                        </td>
                        <td className="py-3 text-muted-foreground">{formatDate(inv.issuedDate.toISOString())}</td>
                        <td className="py-3 text-muted-foreground">{formatDate(inv.dueDate.toISOString())}</td>
                        <td className="py-3">
                          <Badge variant={statusVariant[inv.status] || 'secondary'}>{inv.status}</Badge>
                        </td>
                        <td className="py-3 text-right font-semibold text-foreground">{formatCurrency(inv.totalCents, currency)}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <InvoiceStatusAction id={inv.id} currentStatus={inv.status} />
                            {inv.status !== 'draft' && inv.status !== 'cancelled' && (
                              <PayLinkButton invoiceId={inv.id} existingUrl={inv.paymentLinkUrl} />
                            )}
                            <Link
                              href={`/invoices/${inv.id}`}
                              target="_blank"
                              title="Download / Print invoice"
                              className="inline-flex items-center justify-center rounded-full border border-border p-1.5 text-muted-foreground hover:border-violet-300 hover:text-violet-600 transition-colors"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
