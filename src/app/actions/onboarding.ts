'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import type { ActionState } from '@/types'

const ONBOARDING_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitch', 'podcasts', 'substack', 'twitter', 'multi', 'other'] as const
const ONBOARDING_TIERS = ['just_starting', 'under_10k', '10k_to_100k', '100k_to_1m', '1m_plus'] as const
const ONBOARDING_PAINS = ['sponsorships', 'rates', 'taxes', 'cashflow', 'organize', 'other'] as const

const OnboardingSchema = z.object({
  primaryPlatform: z.enum(ONBOARDING_PLATFORMS).optional().or(z.literal('').transform(() => undefined)),
  audienceTier: z.enum(ONBOARDING_TIERS).optional().or(z.literal('').transform(() => undefined)),
  primaryPain: z.enum(ONBOARDING_PAINS).optional().or(z.literal('').transform(() => undefined)),
})

export async function completeOnboarding(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await verifySession()

  const result = OnboardingSchema.safeParse({
    primaryPlatform: formData.get('primaryPlatform') ?? '',
    audienceTier: formData.get('audienceTier') ?? '',
    primaryPain: formData.get('primaryPain') ?? '',
  })

  if (!result.success) {
    return { success: false, error: 'Invalid selection' }
  }

  await db.user.update({
    where: { id: session.userId },
    data: {
      primaryPlatform: result.data.primaryPlatform ?? null,
      audienceTier: result.data.audienceTier ?? null,
      primaryPain: result.data.primaryPain ?? null,
      onboardedAt: new Date(),
    },
  })

  redirect('/dashboard')
}
