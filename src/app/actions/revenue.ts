'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { RevenueEntrySchema } from '@/lib/validations/revenue'
import { dollarsToCents } from '@/lib/utils'
import type { ActionState } from '@/types'

export async function createRevenueEntry(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession()

  const raw = {
    source: formData.get('source'),
    amount: formData.get('amount'),
    currency: formData.get('currency') || 'USD',
    description: formData.get('description'),
    platform: formData.get('platform') || undefined,
    date: formData.get('date'),
    dealId: formData.get('dealId') || undefined,
  }

  const result = RevenueEntrySchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: 'Validation failed', fieldErrors: result.error.flatten().fieldErrors }
  }

  const { source, amount, currency, description, platform, date, dealId } = result.data
  const amountCents = dollarsToCents(amount)

  await db.revenueEntry.create({
    data: {
      userId: session.userId,
      source,
      amountCents,
      currency,
      description,
      platform,
      date: new Date(date),
      dealId,
    },
  })

  revalidatePath('/revenue')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function updateRevenueEntry(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession()
  const id = formData.get('id') as string

  const entry = await db.revenueEntry.findUnique({ where: { id } })
  if (!entry || entry.userId !== session.userId) return { success: false, error: 'Not found' }

  const raw = {
    source: formData.get('source'),
    amount: formData.get('amount'),
    currency: 'USD',
    description: formData.get('description'),
    platform: formData.get('platform') || undefined,
    date: formData.get('date'),
  }

  const result = RevenueEntrySchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: 'Validation failed', fieldErrors: result.error.flatten().fieldErrors }
  }

  await db.revenueEntry.update({
    where: { id },
    data: {
      source: result.data.source,
      amountCents: dollarsToCents(result.data.amount),
      description: result.data.description,
      platform: result.data.platform ?? null,
      date: new Date(result.data.date),
    },
  })

  revalidatePath('/revenue')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function deleteRevenueEntry(id: string): Promise<ActionState> {
  const session = await verifySession()

  const entry = await db.revenueEntry.findUnique({ where: { id } })
  if (!entry || entry.userId !== session.userId) {
    return { success: false, error: 'Not found' }
  }

  await db.revenueEntry.delete({ where: { id } })
  revalidatePath('/revenue')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function getRevenueEntries() {
  const session = await verifySession()
  return db.revenueEntry.findMany({
    where: { userId: session.userId },
    orderBy: { date: 'desc' },
    include: { deal: { select: { brandName: true } } },
  })
}
