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

  // Only honor a deal link if the deal is actually the user's own.
  let linkedDealId: string | undefined = undefined
  if (dealId) {
    const deal = await db.deal.findUnique({ where: { id: dealId }, select: { userId: true } })
    if (deal && deal.userId === session.userId) linkedDealId = dealId
  }

  await db.revenueEntry.create({
    data: {
      userId: session.userId,
      source,
      amountCents,
      currency,
      description,
      platform,
      date: new Date(date),
      dealId: linkedDealId,
    },
  })

  revalidatePath('/revenue')
  revalidatePath('/dashboard')
  if (linkedDealId) revalidatePath('/deals') // so the deal's "paid" state refreshes
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

export async function bulkDeleteRevenueEntries(ids: string[]): Promise<ActionState<{ count: number }>> {
  if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'No entries selected' }
  if (ids.length > 500) return { success: false, error: 'Cannot delete more than 500 entries at once' }

  const session = await verifySession()

  const result = await db.revenueEntry.deleteMany({
    where: { id: { in: ids }, userId: session.userId },
  })

  revalidatePath('/revenue')
  revalidatePath('/dashboard')
  return { success: true, data: { count: result.count } }
}

export async function createRefund(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await verifySession()
  const originalId = formData.get('originalId') as string
  const amountRaw = (formData.get('amount') as string | null)?.trim() ?? ''
  const reason = (formData.get('reason') as string | null)?.trim() ?? ''

  const amountNum = parseFloat(amountRaw)
  if (!isFinite(amountNum) || amountNum <= 0) {
    return { success: false, error: 'Refund amount must be a positive number' }
  }
  if (!reason || reason.length < 3) {
    return { success: false, error: 'Reason is required' }
  }

  const original = await db.revenueEntry.findUnique({ where: { id: originalId } })
  if (!original || original.userId !== session.userId) {
    return { success: false, error: 'Original revenue entry not found' }
  }
  if (original.isRefund) {
    return { success: false, error: 'Cannot refund a refund' }
  }
  const refundCents = Math.round(amountNum * 100)
  if (refundCents > original.amountCents) {
    return { success: false, error: `Refund cannot exceed the original ${original.amountCents / 100} amount` }
  }

  await db.revenueEntry.create({
    data: {
      userId: session.userId,
      source: original.source,
      amountCents: -refundCents,
      currency: original.currency,
      description: `Refund: ${reason} (was: ${original.description})`,
      platform: original.platform,
      date: new Date(),
      dealId: original.dealId,
      isRefund: true,
      refundsId: original.id,
    },
  })

  revalidatePath('/revenue')
  revalidatePath('/dashboard')
  revalidatePath('/forecast')
  revalidatePath('/reports')
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
