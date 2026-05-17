'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { InvoiceSchema } from '@/lib/validations/invoice'
import { generateInvoiceNumber, dollarsToCents } from '@/lib/utils'
import type { ActionState } from '@/types'

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

export async function getInvoices() {
  const session = await verifySession()
  return db.invoice.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
}
