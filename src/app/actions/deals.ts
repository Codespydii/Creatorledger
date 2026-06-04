'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { DealSchema } from '@/lib/validations/deal'
import { dollarsToCents } from '@/lib/utils'
import type { ActionState } from '@/types'

const TERMINAL_STAGES = ['completed', 'lost']

export async function createDeal(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession()

  const raw = {
    brandName: formData.get('brandName'),
    contactName: formData.get('contactName') || undefined,
    contactEmail: formData.get('contactEmail') || undefined,
    stage: formData.get('stage'),
    value: formData.get('value'),
    currency: formData.get('currency') || 'USD',
    description: formData.get('description') || undefined,
    deliverables: formData.get('deliverables') || undefined,
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
    notes: formData.get('notes') || undefined,
  }

  const result = DealSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: 'Validation failed', fieldErrors: result.error.flatten().fieldErrors }
  }

  const { brandName, contactName, contactEmail, stage, value, currency, description, deliverables, startDate, endDate, notes } = result.data
  const valueCents = dollarsToCents(value)

  await db.deal.create({
    data: {
      userId: session.userId,
      brandName,
      contactName,
      contactEmail: contactEmail || undefined,
      stage,
      valueCents,
      currency,
      description,
      deliverables,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      notes,
      closedAt: TERMINAL_STAGES.includes(stage) ? new Date() : null,
    },
  })

  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function updateDeal(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession()
  const id = formData.get('id') as string

  const deal = await db.deal.findUnique({ where: { id } })
  if (!deal || deal.userId !== session.userId) return { success: false, error: 'Not found' }

  const raw = {
    brandName: formData.get('brandName'),
    contactName: formData.get('contactName') || undefined,
    contactEmail: formData.get('contactEmail') || undefined,
    stage: formData.get('stage'),
    value: formData.get('value'),
    currency: 'USD',
    description: formData.get('description') || undefined,
    deliverables: formData.get('deliverables') || undefined,
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
    notes: formData.get('notes') || undefined,
  }

  const result = DealSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: 'Validation failed', fieldErrors: result.error.flatten().fieldErrors }
  }

  await db.deal.update({
    where: { id },
    data: {
      brandName: result.data.brandName,
      contactName: result.data.contactName ?? null,
      contactEmail: result.data.contactEmail ?? null,
      stage: result.data.stage,
      valueCents: dollarsToCents(result.data.value),
      description: result.data.description ?? null,
      deliverables: result.data.deliverables ?? null,
      startDate: result.data.startDate ? new Date(result.data.startDate) : null,
      endDate: result.data.endDate ? new Date(result.data.endDate) : null,
      notes: result.data.notes ?? null,
      closedAt: TERMINAL_STAGES.includes(result.data.stage)
        ? (deal.closedAt && TERMINAL_STAGES.includes(deal.stage) ? deal.closedAt : new Date())
        : null,
    },
  })

  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function updateDealStage(id: string, stage: string): Promise<ActionState> {
  const session = await verifySession()

  const deal = await db.deal.findUnique({ where: { id } })
  if (!deal || deal.userId !== session.userId) {
    return { success: false, error: 'Not found' }
  }

  await db.deal.update({
    where: { id },
    data: {
      stage,
      closedAt: TERMINAL_STAGES.includes(stage)
        ? (deal.closedAt && TERMINAL_STAGES.includes(deal.stage) ? deal.closedAt : new Date())
        : null,
    },
  })
  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function deleteDeal(id: string): Promise<ActionState> {
  const session = await verifySession()

  const deal = await db.deal.findUnique({ where: { id } })
  if (!deal || deal.userId !== session.userId) {
    return { success: false, error: 'Not found' }
  }

  await db.deal.delete({ where: { id } })
  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function getDeals() {
  const session = await verifySession()
  return db.deal.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: 'desc' },
  })
}
