import { readFileSync } from 'fs'
import { join } from 'path'
import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { formatDate } from '@/lib/utils'

// The actual product brand assets (same files the app uses), embedded as data
// URLs so the PDF renders identically in the route and in build scripts.
function loadAsset(rel: string): string | null {
  try {
    return `data:image/png;base64,${readFileSync(join(process.cwd(), rel)).toString('base64')}`
  } catch {
    return null
  }
}
const ICON_SRC = loadAsset('public/caelo-icon.png')
const LOGO_SRC = loadAsset('public/caelo-logo.png')

// Invoices always show 2 decimals (e.g. $4,500.00), unlike the app-wide
// formatCurrency which drops trailing zeros for compact dashboard display.
function money(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPriceCents: number
  totalCents: number
}

export interface InvoiceData {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientCompany?: string | null
  clientAddress?: string | null
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
    businessAddress?: string | null
    ein?: string | null
    website?: string | null
  }
}

const COLORS = {
  ink: '#0f172a',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  primary: '#7c3aed',
  sidebar: '#f5f3ff',
  rowAlt: '#faf5ff',
  payBg: '#ede9fe',
  white: '#ffffff',
  emerald: '#059669',
}

const s = StyleSheet.create({
  page: { flexDirection: 'column', fontSize: 9.5, color: COLORS.ink, fontFamily: 'Helvetica' },

  topBar: { height: 12, backgroundColor: COLORS.primary },
  footerBar: { height: 12, backgroundColor: COLORS.primary },
  body: { flexDirection: 'row', flexGrow: 1 },

  // ── Sidebar (FROM / BILL TO / brand)
  sidebar: { width: 200, backgroundColor: COLORS.sidebar, paddingHorizontal: 24, paddingVertical: 30, flexDirection: 'column' },
  sideLabel: { fontSize: 8, color: COLORS.primary, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  sideName: { fontSize: 11, color: COLORS.ink, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  sideLine: { fontSize: 8.5, color: COLORS.muted, marginBottom: 2, lineHeight: 1.35 },
  blockGap: { marginTop: 26 },

  // brand mark — actual product assets (icon + wordmark)
  brand: { marginTop: 'auto' },
  brandRule: { height: 1.2, backgroundColor: COLORS.primary, marginBottom: 9 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  brandIcon: { width: 16, height: 16 },
  brandLogo: { height: 14, width: 49, marginLeft: 6 },
  brandTag: { fontSize: 7, color: COLORS.faint },

  // ── Main column
  main: { flexGrow: 1, flexBasis: 0, paddingHorizontal: 32, paddingVertical: 30, flexDirection: 'column' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26 },
  title: { fontSize: 26, color: COLORS.ink, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  number: { fontSize: 9, color: COLORS.muted, marginTop: 3 },
  metaBlock: { alignItems: 'flex-end' },
  metaPair: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 3 },
  metaLabel: { fontSize: 8, color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 8, paddingTop: 1 },
  metaValue: { fontSize: 9.5, color: COLORS.ink, fontFamily: 'Helvetica-Bold', width: 96, textAlign: 'right' },

  // table
  th: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 7, paddingHorizontal: 10 },
  thText: { fontSize: 8, color: COLORS.white, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  tr: { flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 10 },
  td: { fontSize: 9.5, color: COLORS.ink },
  tdMuted: { fontSize: 9.5, color: COLORS.muted },
  colDesc: { flex: 6, paddingRight: 8 },
  colQty: { flex: 1.2, textAlign: 'center' },
  colRate: { flex: 2, textAlign: 'right' },
  colAmt: { flex: 2, textAlign: 'right' },

  // totals
  totals: { marginTop: 18, marginLeft: 'auto', width: 230 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, fontSize: 9.5, color: COLORS.muted },
  totalsValue: { fontSize: 9.5, color: COLORS.ink },
  totalDue: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4, marginTop: 6 },
  totalDueLabel: { fontSize: 11, color: COLORS.white, fontFamily: 'Helvetica-Bold' },
  totalDueValue: { fontSize: 12, color: COLORS.white, fontFamily: 'Helvetica-Bold' },
  paidRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, fontSize: 9.5, color: COLORS.emerald, fontFamily: 'Helvetica-Bold' },

  // payment box
  payBox: { marginTop: 22, backgroundColor: COLORS.payBg, borderRadius: 6, padding: 13 },
  payTitle: { fontSize: 8, color: COLORS.primary, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  payLine: { fontSize: 9, color: COLORS.ink, marginBottom: 2, lineHeight: 1.4 },
  payLink: { fontSize: 9, color: COLORS.primary, fontFamily: 'Helvetica-Bold' },

  // notes & terms
  terms: { marginTop: 16 },
  termsTitle: { fontSize: 8, color: COLORS.faint, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  termsLine: { fontSize: 8, color: COLORS.muted, lineHeight: 1.45, marginBottom: 3 },
})

const statusLabel: Record<string, string> = {
  draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled',
}

function toISO(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString()
}

function netTerms(issued: Date | string, due: Date | string): string {
  const a = new Date(toISO(issued)).getTime()
  const b = new Date(toISO(due)).getTime()
  const days = Math.round((b - a) / 86_400_000)
  return days > 0 ? `Net ${days}` : 'Due on receipt'
}

function InvoicePdfDocument({ invoice }: { invoice: InvoiceData }) {
  const currency = invoice.user.defaultCurrency ?? 'USD'
  const storedPct = Number(invoice.taxPercent)
  const taxRate = storedPct > 0
    ? storedPct.toFixed(storedPct % 1 === 0 ? 0 : 1)
    : invoice.subtotalCents > 0
      ? ((invoice.taxCents / invoice.subtotalCents) * 100).toFixed(invoice.taxCents === 0 ? 0 : 1)
      : '0'
  const terms = netTerms(invoice.issuedDate, invoice.dueDate)
  const dueDays = terms === 'Due on receipt' ? '0' : terms.replace('Net ', '')

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="LETTER" style={s.page}>
        {/* Top accent bar */}
        <View style={s.topBar} fixed />

        <View style={s.body}>
          {/* ── Left sidebar: FROM, BILL TO, brand mark ── */}
          <View style={s.sidebar}>
            <View>
              <Text style={s.sideLabel}>From</Text>
              <Text style={s.sideName}>{invoice.user.name}</Text>
              {invoice.user.channelName ? <Text style={s.sideLine}>{invoice.user.channelName}</Text> : null}
              {invoice.user.businessAddress ? <Text style={s.sideLine}>{invoice.user.businessAddress}</Text> : null}
              {invoice.user.ein ? <Text style={s.sideLine}>EIN: {invoice.user.ein}</Text> : null}
              <Text style={s.sideLine}>{invoice.user.email}</Text>
              {invoice.user.website ? <Text style={s.sideLine}>{invoice.user.website}</Text> : null}
            </View>

            <View style={s.blockGap}>
              <Text style={s.sideLabel}>Bill To</Text>
              <Text style={s.sideName}>{invoice.clientName}</Text>
              {invoice.clientCompany ? <Text style={s.sideLine}>{invoice.clientCompany}</Text> : null}
              {invoice.clientAddress ? <Text style={s.sideLine}>{invoice.clientAddress}</Text> : null}
              {invoice.clientEmail ? <Text style={s.sideLine}>{invoice.clientEmail}</Text> : null}
            </View>

            {/* Brand mark — real product icon + wordmark, pinned bottom-left */}
            <View style={s.brand}>
              <View style={s.brandRule} />
              <View style={s.brandRow}>
                {ICON_SRC ? <Image src={ICON_SRC} style={s.brandIcon} /> : null}
                {LOGO_SRC ? <Image src={LOGO_SRC} style={s.brandLogo} /> : null}
              </View>
              <Text style={s.brandTag}>Smart Invoicing for Creators</Text>
            </View>
          </View>

          {/* ── Main column ── */}
          <View style={s.main}>
            <View style={s.headerRow}>
              <View>
                <Text style={s.title}>INVOICE</Text>
                <Text style={s.number}>{invoice.invoiceNumber}</Text>
              </View>
              <View style={s.metaBlock}>
                <View style={s.metaPair}>
                  <Text style={s.metaLabel}>Invoice Date</Text>
                  <Text style={s.metaValue}>{formatDate(toISO(invoice.issuedDate))}</Text>
                </View>
                <View style={s.metaPair}>
                  <Text style={s.metaLabel}>Due Date</Text>
                  <Text style={s.metaValue}>{formatDate(toISO(invoice.dueDate))}</Text>
                </View>
                <View style={s.metaPair}>
                  <Text style={s.metaLabel}>Terms</Text>
                  <Text style={s.metaValue}>{terms}</Text>
                </View>
                <View style={s.metaPair}>
                  <Text style={s.metaLabel}>Currency</Text>
                  <Text style={s.metaValue}>{currency}</Text>
                </View>
                <View style={s.metaPair}>
                  <Text style={s.metaLabel}>Status</Text>
                  <Text style={s.metaValue}>{statusLabel[invoice.status] ?? invoice.status}</Text>
                </View>
              </View>
            </View>

            {/* Line items */}
            <View style={s.th}>
              <Text style={[s.thText, s.colDesc]}>Description</Text>
              <Text style={[s.thText, s.colQty]}>Qty</Text>
              <Text style={[s.thText, s.colRate]}>Rate</Text>
              <Text style={[s.thText, s.colAmt]}>Amount</Text>
            </View>
            {invoice.items.map((item, i) => (
              <View key={item.id} style={[s.tr, { backgroundColor: i % 2 === 1 ? COLORS.rowAlt : COLORS.white }]}>
                <Text style={[s.td, s.colDesc]}>{item.description}</Text>
                <Text style={[s.tdMuted, s.colQty]}>{item.quantity}</Text>
                <Text style={[s.tdMuted, s.colRate]}>{money(item.unitPriceCents, currency)}</Text>
                <Text style={[s.td, s.colAmt, { fontFamily: 'Helvetica-Bold' }]}>{money(item.totalCents, currency)}</Text>
              </View>
            ))}

            {/* Totals */}
            <View style={s.totals}>
              <View style={s.totalsRow}>
                <Text>Subtotal</Text>
                <Text style={s.totalsValue}>{money(invoice.subtotalCents, currency)}</Text>
              </View>
              <View style={s.totalsRow}>
                <Text>Sales Tax ({taxRate}%)</Text>
                <Text style={s.totalsValue}>{money(invoice.taxCents, currency)}</Text>
              </View>
              <View style={s.totalDue}>
                <Text style={s.totalDueLabel}>Total Due</Text>
                <Text style={s.totalDueValue}>{money(invoice.totalCents, currency)}</Text>
              </View>
              {invoice.paidDate && (
                <View style={s.paidRow}>
                  <Text>Paid on</Text>
                  <Text>{formatDate(toISO(invoice.paidDate))}</Text>
                </View>
              )}
            </View>

            {/* Payment instructions */}
            <View style={s.payBox}>
              <Text style={s.payTitle}>Payment Instructions</Text>
              <Text style={s.payLine}>Payment is due within {dueDays} days of the invoice date ({terms}).</Text>
              {invoice.paymentLinkUrl && invoice.status !== 'paid' ? (
                <Text style={s.payLine}>Pay online: <Text style={s.payLink}>{invoice.paymentLinkUrl}</Text></Text>
              ) : (
                <Text style={s.payLine}>
                  Make payment payable to <Text style={{ fontFamily: 'Helvetica-Bold' }}>{invoice.user.name}</Text>
                  {invoice.user.email ? <Text> · {invoice.user.email}</Text> : null}.
                </Text>
              )}
            </View>

            {/* Notes & Terms — written by the creator on the invoice form */}
            {invoice.notes ? (
              <View style={s.terms}>
                <Text style={s.termsTitle}>Notes &amp; Terms</Text>
                <Text style={s.termsLine}>{invoice.notes}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Bottom accent bar */}
        <View style={s.footerBar} fixed />
      </Page>
    </Document>
  )
}

export async function renderInvoicePdf(invoice: InvoiceData): Promise<Buffer> {
  return renderToBuffer(<InvoicePdfDocument invoice={invoice} />)
}
