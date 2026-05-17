'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { dollarsToCents } from '@/lib/utils'
import type { ActionState } from '@/types'

const ContributeSchema = z.object({
  niche: z.string().min(1, 'Pick a niche'),
  platform: z.string().min(1, 'Pick a platform'),
  format: z.string().min(1, 'Pick a format'),
  subscriberTier: z.string().min(1, 'Pick a creator size'),
  amount: z.coerce.number().positive('Enter a deal amount in USD').max(10_000_000),
  exclusivity: z.string().optional(),
  usageRights: z.string().optional(),
})

export async function contributeRate(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await verifySession()

  const result = ContributeSchema.safeParse({
    niche: formData.get('niche'),
    platform: formData.get('platform'),
    format: formData.get('format'),
    subscriberTier: formData.get('subscriberTier'),
    amount: formData.get('amount'),
    exclusivity: formData.get('exclusivity'),
    usageRights: formData.get('usageRights') || undefined,
  })

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    const first = Object.values(fieldErrors)[0]?.[0]
    return { success: false, error: first ?? 'Validation failed', fieldErrors }
  }

  const d = result.data
  await db.rateBenchmark.create({
    data: {
      userId: session.userId,
      niche: d.niche,
      platform: d.platform,
      format: d.format,
      subscriberTier: d.subscriberTier,
      amountCents: dollarsToCents(d.amount),
      exclusivity: d.exclusivity === 'on' || d.exclusivity === 'true',
      usageRights: d.usageRights || null,
      source: 'user',
    },
  })

  revalidatePath('/benchmarks')
  return { success: true, data: undefined }
}
