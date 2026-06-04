'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { InvoiceSchema } from '@/lib/validations/invoice'
import { generateInvoiceNumber, dollarsToCents, formatCurrency, formatDate } from '@/lib/utils'
import { renderInvoicePdf } from '@/lib/invoice-pdf'
import { sendInvoiceToClient, isEmailConfigured } from '@/lib/email'
import type { ActionState } from '@/types'

function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export async function createInvoice(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession()

  const itemsRaw = formData.get('items')
  let items: { description: string; quantity: number; unitPrice: string }[] = []
  try {
    items = JSON.parse(itemsRaw as string)
  } catch {
    return { success: false, error: 'Invalid invoice items' }
  }

  const raw = {
    clientName: formData.get('clientName'),
    clientEmail: formData.get('clientEmail'),
    dueDate: formData.get('dueDate'),
    taxPercent: formData.get('taxPercent') || '0',
    notes: formData.get('notes') || undefined,
    items,
  }

  const result = InvoiceSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: 'Validation failed', fieldErrors: result.error.flatten().fieldErrors }
  }

  const { clientName, clientEmail, dueDate, taxPercent, notes, items: validItems } = result.data

  const lineItems = validItems.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPriceCents: dollarsToCents(item.unitPrice),
    totalCents: dollarsToCents(item.unitPrice) * item.quantity,
  }))

  const subtotalCents = lineItems.reduce((sum, item) => sum + item.totalCents, 0)
  const taxCents = Math.round(subtotalCents * (parseFloat(taxPercent) / 100))
  const totalCents = subtotalCents + taxCents

  await db.invoice.create({
    data: {
      userId: session.userId,
      invoiceNumber: generateInvoiceNumber(),
      clientName,
      clientEmail,
      status: 'draft',
      subtotalCents,
      taxPercent: parseFloat(taxPercent),
      taxCents,
      totalCents,
      dueDate: new Date(dueDate),
      notes,
      items: { create: lineItems },
    },
  })

  revalidatePath('/invoices')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function updateInvoiceStatus(id: string, status: string): Promise<ActionState> {
  const session = await verifySession()

  const invoice = await db.invoice.findUnique({ where: { id } })
  if (!invoice || invoice.userId !== session.userId) {
    return { success: false, error: 'Not found' }
  }

  await db.invoice.update({
    where: { id },
    data: {
      status,
      paidDate: status === 'paid' ? new Date() : undefined,
    },
  })

  revalidatePath('/invoices')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function sendInvoiceEmail(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await verifySession()
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email service is not configured. Add RESEND_API_KEY first.' }
  }

  const id = formData.get('invoiceId') as string
  const overrideEmail = (formData.get('toEmail') as string | null)?.trim() || null
  const message = (formData.get('message') as string | null)?.trim() || undefined

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { items: true, user: true },
  })
  if (!invoice || invoice.userId !== session.userId) {
    return { success: false, error: 'Invoice not found' }
  }

  const toEmail = overrideEmail ?? invoice.clientEmail
  if (!toEmail) {
    return { success: false, error: 'No recipient email — set one on the invoice first' }
  }

  try {
    const pdfBuffer = await renderInvoicePdf(invoice)
    const currency = invoice.user.defaultCurrency ?? 'USD'
    const publicUrl = invoice.publicId
      ? `${getAppUrl()}/i/${invoice.publicId}`
      : `${getAppUrl()}/invoices/${invoice.id}` // fallback, requires login

    await sendInvoiceToClient({
      toEmail,
      toName: invoice.clientName,
      fromName: invoice.user.channelName || invoice.user.name,
      fromEmail: invoice.user.email,
      invoiceNumber: invoice.invoiceNumber,
      totalDisplay: formatCurrency(invoice.totalCents, currency),
      dueDate: formatDate(invoice.dueDate.toISOString()),
      publicUrl,
      message,
      pdfBuffer,
    })

    // Auto-mark sent invoices as 'sent' if they were still draft
    if (invoice.status === 'draft') {
      await db.invoice.update({ where: { id: invoice.id }, data: { status: 'sent' } })
    }

    revalidatePath('/invoices')
    return { success: true, data: undefined }
  } catch (err) {
    console.error('sendInvoiceEmail failed:', err instanceof Error ? err.message : err)
    return { success: false, error: err instanceof Error ? err.message : 'Send failed' }
  }
}

export async function getInvoices() {
  const session = await verifySession()
  return db.invoice.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateInvoice(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession()
  const id = formData.get('id') as string

  const existing = await db.invoice.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.userId) {
    return { success: false, error: 'Not found' }
  }

  const itemsRaw = formData.get('items')
  let items: { description: string; quantity: number; unitPrice: string }[] = []
  try {
    items = JSON.parse(itemsRaw as string)
  } catch {
    return { success: false, error: 'Invalid invoice items' }
  }

  const result = InvoiceSchema.safeParse({
    clientName: formData.get('clientName'),
    clientEmail: formData.get('clientEmail'),
    dueDate: formData.get('dueDate'),
    taxPercent: formData.get('taxPercent') || '0',
    notes: formData.get('notes') || undefined,
    items,
  })
  if (!result.success) {
    return { success: false, error: 'Validation failed', fieldErrors: result.error.flatten().fieldErrors }
  }

  const { clientName, clientEmail, dueDate, taxPercent, notes, items: validItems } = result.data

  const lineItems = validItems.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPriceCents: dollarsToCents(item.unitPrice),
    totalCents: dollarsToCents(item.unitPrice) * item.quantity,
  }))

  const subtotalCents = lineItems.reduce((sum, item) => sum + item.totalCents, 0)
  const taxCents = Math.round(subtotalCents * (parseFloat(taxPercent) / 100))
  const totalCents = subtotalCents + taxCents

  // Replace line items atomically, then update invoice fields.
  await db.$transaction([
    db.invoiceLineItem.deleteMany({ where: { invoiceId: id } }),
    db.invoice.update({
      where: { id },
      data: {
        clientName,
        clientEmail,
        dueDate: new Date(dueDate),
        taxPercent: parseFloat(taxPercent),
        subtotalCents,
        taxCents,
        totalCents,
        notes: notes ?? null,
        items: { create: lineItems },
      },
    }),
  ])

  revalidatePath('/invoices')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function bulkDeleteInvoices(ids: string[]): Promise<ActionState<{ count: number }>> {
  if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'No invoices selected' }
  if (ids.length > 500) return { success: false, error: 'Cannot delete more than 500 invoices at once' }

  const session = await verifySession()

  // Line items + reminder logs cascade on invoice delete (onDelete: Cascade).
  const result = await db.invoice.deleteMany({
    where: { id: { in: ids }, userId: session.userId },
  })

  revalidatePath('/invoices')
  revalidatePath('/dashboard')
  return { success: true, data: { count: result.count } }
}
