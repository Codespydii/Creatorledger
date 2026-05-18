import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { InvoiceDocument } from '@/components/features/invoices/invoice-document'
import { PrintButton } from './print-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InvoicePrintPage({ params }: Props) {
  const { id } = await params
  const session = await verifySession()

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { items: true, user: true },
  })

  if (!invoice || invoice.userId !== session.userId) notFound()

  return (
    <>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      <div className="min-h-screen bg-white p-8">
        <div className="print:hidden mb-8 flex items-center justify-between">
          <a href="/invoices" className="text-sm text-violet-600 hover:underline">← Back to Invoices</a>
          <PrintButton />
        </div>
        <InvoiceDocument invoice={invoice} />
      </div>
    </>
  )
}
