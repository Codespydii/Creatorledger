import 'server-only'
import { Document, Page, View, Text, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { formatCurrency, formatDate } from '@/lib/utils'

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
  status: string
  subtotalCents: number
  taxCents: number
  taxPercent: number | string | { toString(): string }
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
  }
}

const COLORS = {
  ink: '#0f172a',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  primary: '#7c3aed',
  emerald: '#059669',
}

const s = StyleSheet.create({
  page: { padding: 48, fontSize: 10, color: COLORS.ink, fontFamily: 'Helvetica' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 },
  title: { fontSize: 24, fontWeight: 700, color: COLORS.ink },
  number: { fontSize: 9, color: COLORS.muted, marginTop: 4 },
  fromName: { fontSize: 12, fontWeight: 700, color: COLORS.ink, textAlign: 'right' },
  fromLine: { fontSize: 9, color: COLORS.muted, textAlign: 'right' },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 36 },
  metaCol: { flex: 1 },
  label: { fontSize: 8, color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 },
  billToName: { fontSize: 11, fontWeight: 700, color: COLORS.ink },
  billToLine: { fontSize: 9, color: COLORS.muted },
  rightAlign: { textAlign: 'right' },
  metaPair: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginBottom: 2 },

  th: { flexDirection: 'row', borderBottomWidth: 2, borderColor: COLORS.border, paddingBottom: 6, marginBottom: 4 },
  thText: { fontSize: 8, fontWeight: 700, color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 1 },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#f1f5f9', paddingVertical: 8 },
  td: { fontSize: 10, color: COLORS.ink },
  tdMuted: { fontSize: 10, color: COLORS.muted },
  colDesc: { flex: 6, paddingRight: 8 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 2, textAlign: 'right' },
  colTotal: { flex: 2, textAlign: 'right', fontWeight: 700 },

  totalsBox: { marginTop: 24, marginLeft: 'auto', width: 220 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, fontSize: 10, color: COLORS.muted },
  totalsRowFinal: {
    flexDirection: 'row', justifyContent: 'space-between',
    fontSize: 12, fontWeight: 700, color: COLORS.ink,
    borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 6, marginTop: 4,
  },
  paidRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: COLORS.emerald, fontWeight: 700 },

  section: { marginTop: 28, paddingTop: 16, borderTopWidth: 1, borderColor: COLORS.border },
  payLink: { color: COLORS.primary, fontSize: 10 },

  footer: { marginTop: 40, fontSize: 8, color: COLORS.faint, textAlign: 'center' },
})

const statusLabel: Record<string, string> = {
  draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled',
}

function toISO(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString()
}

function InvoicePdfDocument({ invoice }: { invoice: InvoiceData }) {
  const currency = invoice.user.defaultCurrency ?? 'USD'
  const storedPct = Number(invoice.taxPercent)
  const taxRate = storedPct > 0
    ? storedPct.toFixed(storedPct % 1 === 0 ? 0 : 1)
    : invoice.subtotalCents > 0
      ? ((invoice.taxCents / invoice.subtotalCents) * 100).toFixed(1)
      : '0'

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={s.page}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>INVOICE</Text>
            <Text style={s.number}>{invoice.invoiceNumber}</Text>
          </View>
          <View>
            <Text style={s.fromName}>{invoice.user.name}</Text>
            {invoice.user.channelName ? <Text style={s.fromLine}>{invoice.user.channelName}</Text> : null}
            <Text style={s.fromLine}>{invoice.user.email}</Text>
          </View>
        </View>

        <View style={s.metaRow}>
          <View style={s.metaCol}>
            <Text style={s.label}>Bill To</Text>
            <Text style={s.billToName}>{invoice.clientName}</Text>
            <Text style={s.billToLine}>{invoice.clientEmail}</Text>
          </View>
          <View style={s.metaCol}>
            <View style={s.metaPair}>
              <Text style={s.label}>Issue Date</Text>
              <Text style={s.tdMuted}>{formatDate(toISO(invoice.issuedDate))}</Text>
            </View>
            <View style={s.metaPair}>
              <Text style={s.label}>Due Date</Text>
              <Text style={s.tdMuted}>{formatDate(toISO(invoice.dueDate))}</Text>
            </View>
            <View style={s.metaPair}>
              <Text style={s.label}>Status</Text>
              <Text style={s.td}>{statusLabel[invoice.status] ?? invoice.status}</Text>
            </View>
          </View>
        </View>

        <View style={s.th}>
          <Text style={[s.thText, s.colDesc]}>Description</Text>
          <Text style={[s.thText, s.colQty]}>Qty</Text>
          <Text style={[s.thText, s.colPrice]}>Unit Price</Text>
          <Text style={[s.thText, s.colTotal]}>Total</Text>
        </View>
        {invoice.items.map(item => (
          <View key={item.id} style={s.tr}>
            <Text style={[s.td, s.colDesc]}>{item.description}</Text>
            <Text style={[s.tdMuted, s.colQty]}>{item.quantity}</Text>
            <Text style={[s.tdMuted, s.colPrice]}>{formatCurrency(item.unitPriceCents, currency)}</Text>
            <Text style={[s.td, s.colTotal]}>{formatCurrency(item.totalCents, currency)}</Text>
          </View>
        ))}

        <View style={s.totalsBox}>
          <View style={s.totalsRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(invoice.subtotalCents, currency)}</Text>
          </View>
          {invoice.taxCents > 0 && (
            <View style={s.totalsRow}>
              <Text>Tax ({taxRate}%)</Text>
              <Text>{formatCurrency(invoice.taxCents, currency)}</Text>
            </View>
          )}
          <View style={s.totalsRowFinal}>
            <Text>Total</Text>
            <Text>{formatCurrency(invoice.totalCents, currency)}</Text>
          </View>
          {invoice.paidDate && (
            <View style={s.paidRow}>
              <Text>Paid on</Text>
              <Text>{formatDate(toISO(invoice.paidDate))}</Text>
            </View>
          )}
        </View>

        {invoice.paymentLinkUrl && invoice.status !== 'paid' && (
          <View style={s.section}>
            <Text style={s.label}>Pay Online</Text>
            <Text style={s.payLink}>{invoice.paymentLinkUrl}</Text>
          </View>
        )}

        {invoice.notes && (
          <View style={s.section}>
            <Text style={s.label}>Notes</Text>
            <Text style={s.tdMuted}>{invoice.notes}</Text>
          </View>
        )}

        <Text style={s.footer}>Sent via Creator Ledger · creatorledgerapp.vercel.app</Text>
      </Page>
    </Document>
  )
}

export async function renderInvoicePdf(invoice: InvoiceData): Promise<Buffer> {
  return renderToBuffer(<InvoicePdfDocument invoice={invoice} />)
}
