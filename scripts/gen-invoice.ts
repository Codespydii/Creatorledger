/* eslint-disable no-console */
import { writeFileSync } from 'fs'
import { renderInvoicePdf } from '../src/lib/invoice-pdf-document'

const now = new Date()
const due = new Date(now.getTime() + 30 * 86_400_000)

const sample = {
  invoiceNumber: 'INV-2026-0001',
  clientName: 'Jordan Rivera',
  clientEmail: 'ap@northwindmedia.co',
  clientCompany: 'Northwind Media LLC',
  clientAddress: '1200 Brand Ave, Austin, TX 78701',
  status: 'sent',
  subtotalCents: 600000,
  taxCents: 0,
  taxPercent: 0,
  totalCents: 600000,
  issuedDate: now,
  dueDate: due,
  paidDate: null,
  notes: 'Payment due within 30 days (Net 30) via ACH or card. A 1.5%/month late fee applies after the due date. Deliverables approved per SOW dated May 2026. Thanks for working with me!',
  paymentLinkUrl: null,
  items: [
    { id: '1', description: 'Sponsored video — 60s dedicated integration', quantity: 1, unitPriceCents: 450000, totalCents: 450000 },
    { id: '2', description: 'Usage rights — paid media, 90 days', quantity: 1, unitPriceCents: 150000, totalCents: 150000 },
  ],
  user: {
    name: 'Caelo',
    channelName: null,
    email: 'billing@caelo.io',
    defaultCurrency: 'USD',
    businessAddress: '548 Market St, Suite 200, San Francisco, CA 94104',
    ein: '88-1234567',
    website: 'caelo.io',
  },
}

async function main() {
  const pdf = await renderInvoicePdf(sample)
  writeFileSync('caelo_invoice.pdf', pdf)
  console.log('wrote caelo_invoice.pdf', Math.round(pdf.length / 1024) + 'KB')
}
main().catch((e) => { console.error(e); process.exit(1) })
