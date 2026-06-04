import { notFound } from 'next/navigation'
import { Download } from 'lucide-react'
import { db } from '@/lib/db'
import { InvoiceDocument } from '@/components/features/invoices/invoice-document'

interface Props {
  params: Promise<{ publicId: string }>
}

export const metadata = {
  title: 'Invoice — Caelo',
  robots: { index: false, follow: false },
}

export default async function PublicInvoicePage({ params }: Props) {
  const { publicId } = await params

  const invoice = await db.invoice.findUnique({
    where: { publicId },
    include: { items: true, user: true },
  })
  if (!invoice) notFound()

  return (
    <>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      <div className="min-h-screen bg-white p-8">
        <div className="print:hidden mb-8 flex items-center justify-end gap-3 max-w-2xl mx-auto">
          <a
            href={`/i/${publicId}/pdf`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" /> Download PDF
          </a>
        </div>
        <InvoiceDocument invoice={invoice} />
        <p className="mt-12 text-center text-xs text-gray-400">
          Sent via <a href="https://creatorledgerapp.vercel.app" className="text-violet-600 hover:underline">Caelo</a>
        </p>
      </div>
    </>
  )
}
