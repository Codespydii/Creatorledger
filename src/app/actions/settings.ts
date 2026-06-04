'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifySession, deleteSession } from '@/lib/session'
import { SUPPORTED_CURRENCIES } from '@/lib/currencies'
import type { ActionState } from '@/types'

const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  channelName: z.string().max(100).optional(),
  platform: z.string().max(100).optional(),
  defaultCurrency: z.enum(SUPPORTED_CURRENCIES).optional(),
  niche: z.string().max(40).optional(),
  businessAddress: z.string().max(200).optional(),
  ein: z.string().max(40).optional(),
  website: z.string().max(200).optional(),
})

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export async function updateProfile(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession()

  const result = ProfileSchema.safeParse({
    name: formData.get('name'),
    channelName: formData.get('channelName') || undefined,
    platform: formData.get('platform') || undefined,
    defaultCurrency: formData.get('defaultCurrency') || undefined,
    niche: formData.get('niche') || undefined,
    businessAddress: formData.get('businessAddress') || undefined,
    ein: formData.get('ein') || undefined,
    website: formData.get('website') || undefined,
  })

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    const first = Object.values(fieldErrors)[0]?.[0]
    return { success: false, error: first ?? 'Validation failed', fieldErrors }
  }

  await db.user.update({
    where: { id: session.userId },
    data: {
      name: result.data.name,
      channelName: result.data.channelName ?? null,
      platform: result.data.platform ?? null,
      ...(result.data.defaultCurrency ? { defaultCurrency: result.data.defaultCurrency } : {}),
      niche: result.data.niche ?? null,
      businessAddress: result.data.businessAddress ?? null,
      ein: result.data.ein ?? null,
      website: result.data.website ?? null,
    },
  })

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

export async function changePassword(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession()

  const result = PasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    const first = Object.values(fieldErrors)[0]?.[0]
    return { success: false, error: first ?? 'Validation failed', fieldErrors }
  }

  const user = await db.user.findUnique({ where: { id: session.userId } })
  if (!user) return { success: false, error: 'User not found' }
  if (!user.passwordHash) {
    return { success: false, error: 'This account uses Google sign-in. Manage your password in your Google account.' }
  }

  const valid = await bcrypt.compare(result.data.currentPassword, user.passwordHash)
  if (!valid) return { success: false, error: 'Current password is incorrect' }

  const hash = await bcrypt.hash(result.data.newPassword, 12)
  await db.user.update({ where: { id: session.userId }, data: { passwordHash: hash } })

  return { success: true, data: undefined }
}

export async function deleteAccount(): Promise<void> {
  const session = await verifySession()
  await db.user.delete({ where: { id: session.userId } })
  await deleteSession()
  redirect('/signup')
}
