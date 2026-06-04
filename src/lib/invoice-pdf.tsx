import 'server-only'

// Server-only entry point. The actual document + renderer live in
// ./invoice-pdf-document so they can also be exercised by build scripts
// (e.g. sample generation) without tripping the server-only guard.
export { renderInvoicePdf } from './invoice-pdf-document'
export type { InvoiceData, InvoiceItem } from './invoice-pdf-document'
