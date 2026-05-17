'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { ExpenseSchema } from '@/lib/validations/expense'
import { dollarsToCents } from '@/lib/utils'
import type { ActionState } from '@/types'

export async function createExpense(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession()

  const raw = {
    category: formData.get('category'),
    amount: formData.get('amount'),
    currency: formData.get('currency') || 'USD',
    description: formData.get('description'),
    vendor: formData.get('vendor') || undefined,
    date: formData.get('date'),
  }

  const result = ExpenseSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: 'Validation failed', fieldErrors: result.error.flatten().fieldErrors }
  }

  const { category, amount, currency, description, vendor, date } = result.data
  const amountCents = dollarsToCents(amount)

  await db.expense.create({
    data: {
      userId: session.userId,
      category,
      amountCents,
      currency,
      description,
      vendor,
      date: new Date(date),
    },
  })

  revalidatePath('/expenses')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function updateExpense(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession()
  const id = formData.get('id') as string

  const expense = await db.expense.findUnique({ where: { id } })
  if (!expense || expense.userId !== session.userId) return { success: false, error: 'Not found' }

  const raw = {
    category: formData.get('category'),
    amount: formData.get('amount'),
    currency: 'USD',
    description: formData.get('description'),
    vendor: formData.get('vendor') || undefined,
    date: formData.get('date'),
  }

  const result = ExpenseSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: 'Validation failed', fieldErrors: result.error.flatten().fieldErrors }
  }

  await db.expense.update({
    where: { id },
    data: {
      category: result.data.category,
      amountCents: dollarsToCents(result.data.amount),
      description: result.data.description,
      vendor: result.data.vendor ?? null,
      date: new Date(result.data.date),
    },
  })

  revalidatePath('/expenses')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function deleteExpense(id: string): Promise<ActionState> {
  const session = await verifySession()

  const expense = await db.expense.findUnique({ where: { id } })
  if (!expense || expense.userId !== session.userId) {
    return { success: false, error: 'Not found' }
  }

  await db.expense.delete({ where: { id } })
  revalidatePath('/expenses')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function getExpenses() {
  const session = await verifySession()
  return db.expense.findMany({
    where: { userId: session.userId },
    orderBy: { date: 'desc' },
  })
}
