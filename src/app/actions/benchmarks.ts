'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { dollarsToCents } from '@/lib/utils'
import { NICHES, PLATFORMS, FORMATS, SUBSCRIBER_TIERS } from '@/lib/benchmarks-constants'
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

const isNiche = (v: string) => NICHES.some((n) => n.value === v)
const isPlatform = (v: string) => PLATFORMS.some((p) => p.value === v)
const isTier = (v: string) => SUBSCRIBER_TIERS.some((t) => t.value === v)
// A format is valid only if it exists AND belongs to the chosen platform.
const isFormatForPlatform = (format: string, platform: string) =>
  FORMATS.some((f) => f.value === format && f.platform === platform)

const VerifiedSchema = z.object({
  dealId: z.string().min(1, 'Missing deal reference'),
  niche: z.string().min(1, 'Pick a niche'),
  platform: z.string().min(1, 'Pick a platform'),
  format: z.string().min(1, 'Pick a format'),
  subscriberTier: z.string().min(1, 'Pick a creator size'),
  amount: z.coerce.number().positive('Enter a deal amount in USD').max(10_000_000),
  exclusivity: z.string().optional(),
})

export async function contributeRate(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await verifySession()

  const result = ContributeSchema.safeParse({
    // Coerce null → '' so a missing select yields the friendly "Pick a …"
    // message instead of Zod's raw "expected string, received null".
    niche: formData.get('niche') ?? '',
    platform: formData.get('platform') ?? '',
    format: formData.get('format') ?? '',
    subscriberTier: formData.get('subscriberTier') ?? '',
    amount: formData.get('amount'),
    exclusivity: formData.get('exclusivity') || undefined,
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

/**
 * Contribute a rate sourced from one of the creator's own tracked deals.
 * Tagged `source: 'verified'` and linked to the deal (dedup + audit). Only the
 * six anonymous dimensions are persisted — brand/contact/notes never leave the
 * account. The deal must be the user's own, completed, paid (revenue-linked),
 * in USD, and not already contributed.
 */
export async function contributeVerifiedRate(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await verifySession()

  const result = VerifiedSchema.safeParse({
    dealId: formData.get('dealId') ?? '',
    niche: formData.get('niche') ?? '',
    platform: formData.get('platform') ?? '',
    format: formData.get('format') ?? '',
    subscriberTier: formData.get('subscriberTier') ?? '',
    amount: formData.get('amount'),
    exclusivity: formData.get('exclusivity') || undefined,
  })

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    const first = Object.values(fieldErrors)[0]?.[0]
    return { success: false, error: first ?? 'Validation failed', fieldErrors }
  }

  const d = result.data

  // Reject junk dimensions before they reach the public pool.
  if (!isNiche(d.niche)) return { success: false, error: 'Pick a valid niche.' }
  if (!isPlatform(d.platform)) return { success: false, error: 'Pick a valid platform.' }
  if (!isTier(d.subscriberTier)) return { success: false, error: 'Pick a valid audience size.' }
  if (!isFormatForPlatform(d.format, d.platform)) {
    return { success: false, error: "Pick a format that matches the platform." }
  }

  // Re-verify the deal server-side — never trust the client.
  const deal = await db.deal.findUnique({
    where: { id: d.dealId },
    select: {
      userId: true,
      stage: true,
      currency: true,
      benchmark: { select: { id: true } },
      _count: { select: { revenues: true } },
    },
  })

  if (!deal || deal.userId !== session.userId) {
    return { success: false, error: 'Deal not found.' }
  }
  if (deal.stage !== 'completed') {
    return { success: false, error: 'Only completed deals can be contributed as a verified rate.' }
  }
  if (deal._count.revenues === 0) {
    return {
      success: false,
      error: 'Log the payment for this deal in Revenue first — verified rates come from paid deals.',
    }
  }
  if (deal.currency !== 'USD') {
    return { success: false, error: 'Verified contributions currently support USD deals only.' }
  }
  if (deal.benchmark) {
    return { success: false, error: "You've already contributed this deal to the benchmarks." }
  }

  try {
    await db.rateBenchmark.create({
      data: {
        userId: session.userId,
        dealId: d.dealId,
        niche: d.niche,
        platform: d.platform,
        format: d.format,
        subscriberTier: d.subscriberTier,
        amountCents: dollarsToCents(d.amount),
        currency: 'USD',
        exclusivity: d.exclusivity === 'on' || d.exclusivity === 'true',
        source: 'verified',
      },
    })
  } catch (err) {
    // Unique(deal_id) guards against a double-submit race.
    if (err instanceof Error && err.message.includes('rate_benchmarks_deal_id_key')) {
      return { success: false, error: "You've already contributed this deal to the benchmarks." }
    }
    throw err
  }

  // Remember the creator's niche so we can pre-fill it next time.
  await db.user.update({ where: { id: session.userId }, data: { niche: d.niche } })

  revalidatePath('/benchmarks')
  revalidatePath('/deals')
  return { success: true, data: undefined }
}
