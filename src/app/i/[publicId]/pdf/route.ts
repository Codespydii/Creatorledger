import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { renderInvoicePdf } from '@/lib/invoice-pdf'

interface Props {
  params: Promise<{ publicId: string }>
}

export async function GET(_req: NextRequest, { params }: Props) {
  const { publicId } = await params

  const invoice = await db.invoice.findUnique({
    where: { publicId },
    include: { items: true, user: true },
  })
  if (!invoice) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const pdf = await renderInvoicePdf(invoice)
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.pdf"`,
      'Cache-Control': 'public, max-age=60',
    },
  })
}
