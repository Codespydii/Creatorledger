'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import type { ActionState } from '@/types'

const VALID_REVENUE_SOURCES = new Set([
  'adsense', 'sponsorship', 'brand_deal', 'affiliate', 'tiktok_fund',
  'patreon', 'substack', 'memberships', 'podcast', 'merchandise', 'tips', 'other',
])

const VALID_EXPENSE_CATEGORIES = new Set([
  'equipment', 'software', 'travel', 'marketing', 'contractor', 'office', 'taxes', 'other',
])

const RowSchema = z.object({
  date: z.string().min(1),
  amount: z.number().or(z.string()).transform((v) => typeof v === 'string' ? parseFloat(v) : v),
  description: z.string().min(1).max(500),
  category: z.string().optional().nullable(),  // source or category
  platform: z.string().optional().nullable(),  // platform or vendor
})

const ImportPayloadSchema = z.object({
  type: z.enum(['revenue', 'expense']),
  rows: z.array(z.unknown()).min(1).max(2000),
})

export async function importCsv(
  _state: ActionState<{ inserted: number; skipped: number; errors: string[] }>,
  formData: FormData,
): Promise<ActionState<{ inserted: number; skipped: number; errors: string[] }>> {
  const session = await verifySession()

  let payload
  try {
    payload = ImportPayloadSchema.parse({
      type: formData.get('type'),
      rows: JSON.parse(formData.get('rows') as string),
    })
  } catch {
    return { success: false, error: 'Invalid import payload' }
  }

  const errors: string[] = []
  const validRows: Array<{
    date: Date
    amountCents: number
    description: string
    category: string
    platform: string | null
  }> = []

  for (let i = 0; i < payload.rows.length; i++) {
    const parsed = RowSchema.safeParse(payload.rows[i])
    if (!parsed.success) {
      errors.push(`Row ${i + 1}: ${parsed.error.issues[0]?.message ?? 'invalid'}`)
      continue
    }
    const { date, amount, description, category, platform } = parsed.data

    const d = new Date(date)
    if (isNaN(d.getTime())) {
      errors.push(`Row ${i + 1}: invalid date "${date}"`)
      continue
    }
    if (!isFinite(amount) || amount <= 0) {
      errors.push(`Row ${i + 1}: amount must be a positive number`)
      continue
    }

    const cleanCategory = (category ?? '').toLowerCase().trim().replace(/\s+/g, '_')
    const fallback = payload.type === 'revenue' ? 'other' : 'other'
    const validSet = payload.type === 'revenue' ? VALID_REVENUE_SOURCES : VALID_EXPENSE_CATEGORIES
    const normalizedCategory = validSet.has(cleanCategory) ? cleanCategory : fallback

    validRows.push({
      date: d,
      amountCents: Math.round(amount * 100),
      description: description.trim(),
      category: normalizedCategory,
      platform: platform?.trim() || null,
    })
  }

  if (validRows.length === 0) {
    return {
      success: false,
      error: `No valid rows. ${errors.length} error${errors.length === 1 ? '' : 's'}:\n${errors.slice(0, 5).join('\n')}`,
    }
  }

  if (payload.type === 'revenue') {
    await db.revenueEntry.createMany({
      data: validRows.map(r => ({
        userId: session.userId,
        source: r.category,
        amountCents: r.amountCents,
        currency: 'USD',
        description: r.description,
        platform: r.platform,
        date: r.date,
      })),
    })
    revalidatePath('/revenue')
  } else {
    await db.expense.createMany({
      data: validRows.map(r => ({
        userId: session.userId,
        category: r.category,
        amountCents: r.amountCents,
        currency: 'USD',
        description: r.description,
        vendor: r.platform,
        date: r.date,
      })),
    })
    revalidatePath('/expenses')
  }
  revalidatePath('/dashboard')
  revalidatePath('/forecast')
  revalidatePath('/reports')

  return {
    success: true,
    data: { inserted: validRows.length, skipped: errors.length, errors },
  }
}
