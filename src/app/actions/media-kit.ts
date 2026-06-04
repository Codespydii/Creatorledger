'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { dollarsToCents } from '@/lib/utils'
import type { ActionState } from '@/types'

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'creator'
}

async function ensureUniqueSlug(base: string, currentUserId: string): Promise<string> {
  let slug = base
  let n = 1
  while (true) {
    const existing = await db.mediaKit.findUnique({ where: { slug } })
    if (!existing || existing.userId === currentUserId) return slug
    n += 1
    slug = `${base}-${n}`
    if (n > 100) return `${base}-${Date.now()}`
  }
}

const MediaKitSchema = z.object({
  slug: z.string().regex(SLUG_RE, 'Lowercase letters, numbers, and dashes only (3-40 chars)').optional(),
  displayName: z.string().max(100).optional(),
  tagline: z.string().max(140).optional(),
  bio: z.string().max(1000).optional(),
  niche: z.string().max(80).optional(),
  location: z.string().max(80).optional(),
  subscriberCount: z.coerce.number().int().min(0).max(1_000_000_000).optional(),
  avgViews: z.coerce.number().int().min(0).max(1_000_000_000).optional(),
  totalViews: z.coerce.number().int().min(0).max(100_000_000_000).optional(),
  engagementRate: z.coerce.number().min(0).max(100).optional(),
  audienceAge: z.string().max(200).optional(),
  audienceGender: z.string().max(200).optional(),
  topCountries: z.string().max(200).optional(),
  rateIntegrated: z.coerce.number().min(0).max(1_000_000).optional(),
  rateDedicated: z.coerce.number().min(0).max(1_000_000).optional(),
  rateShorts: z.coerce.number().min(0).max(1_000_000).optional(),
  sampleWorkUrls: z.string().max(2000).optional(),
  socialLinks: z.string().max(1000).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Accent color must be a hex code like #7c3aed').optional(),
})

function cleanString(v: FormDataEntryValue | null): string | undefined {
  const s = typeof v === 'string' ? v.trim() : ''
  return s.length > 0 ? s : undefined
}

function cleanNumber(v: FormDataEntryValue | null): number | undefined {
  const s = typeof v === 'string' ? v.trim() : ''
  return s.length > 0 ? Number(s) : undefined
}

export async function saveMediaKit(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession()

  const result = MediaKitSchema.safeParse({
    slug: cleanString(formData.get('slug')),
    displayName: cleanString(formData.get('displayName')),
    tagline: cleanString(formData.get('tagline')),
    bio: cleanString(formData.get('bio')),
    niche: cleanString(formData.get('niche')),
    location: cleanString(formData.get('location')),
    subscriberCount: cleanNumber(formData.get('subscriberCount')),
    avgViews: cleanNumber(formData.get('avgViews')),
    totalViews: cleanNumber(formData.get('totalViews')),
    engagementRate: cleanNumber(formData.get('engagementRate')),
    audienceAge: cleanString(formData.get('audienceAge')),
    audienceGender: cleanString(formData.get('audienceGender')),
    topCountries: cleanString(formData.get('topCountries')),
    rateIntegrated: cleanNumber(formData.get('rateIntegrated')),
    rateDedicated: cleanNumber(formData.get('rateDedicated')),
    rateShorts: cleanNumber(formData.get('rateShorts')),
    sampleWorkUrls: cleanString(formData.get('sampleWorkUrls')),
    socialLinks: cleanString(formData.get('socialLinks')),
    contactEmail: cleanString(formData.get('contactEmail')),
    accentColor: cleanString(formData.get('accentColor')),
  })

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    const first = Object.values(fieldErrors)[0]?.[0]
    return { success: false, error: first ?? 'Validation failed', fieldErrors }
  }

  const data = result.data

  const existing = await db.mediaKit.findUnique({ where: { userId: session.userId } })
  const user = await db.user.findUnique({ where: { id: session.userId }, select: { name: true, channelName: true } })

  const baseForSlug = data.slug ?? existing?.slug ?? slugify(user?.channelName || user?.name || session.email.split('@')[0])
  const slug = await ensureUniqueSlug(baseForSlug, session.userId)

  const payload = {
    slug,
    displayName: data.displayName ?? null,
    tagline: data.tagline ?? null,
    bio: data.bio ?? null,
    niche: data.niche ?? null,
    location: data.location ?? null,
    subscriberCount: data.subscriberCount ?? null,
    avgViews: data.avgViews ?? null,
    totalViews: data.totalViews != null ? BigInt(Math.floor(data.totalViews)) : null,
    engagementRate: data.engagementRate ?? null,
    audienceAge: data.audienceAge ?? null,
    audienceGender: data.audienceGender ?? null,
    topCountries: data.topCountries ?? null,
    rateIntegratedCents: data.rateIntegrated != null ? dollarsToCents(data.rateIntegrated) : null,
    rateDedicatedCents: data.rateDedicated != null ? dollarsToCents(data.rateDedicated) : null,
    rateShortsCents: data.rateShorts != null ? dollarsToCents(data.rateShorts) : null,
    sampleWorkUrls: data.sampleWorkUrls ?? null,
    socialLinks: data.socialLinks ?? null,
    contactEmail: data.contactEmail || null,
    accentColor: data.accentColor ?? '#7c3aed',
  }

  if (existing) {
    await db.mediaKit.update({ where: { userId: session.userId }, data: payload })
  } else {
    await db.mediaKit.create({ data: { userId: session.userId, ...payload } })
  }

  revalidatePath('/media-kit')
  revalidatePath(`/m/${slug}`)
  return { success: true, data: undefined }
}

export async function togglePublish(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession()
  const isPublic = formData.get('isPublic') === 'true'

  const existing = await db.mediaKit.findUnique({ where: { userId: session.userId } })
  if (!existing) return { success: false, error: 'Save your media kit before publishing' }

  await db.mediaKit.update({ where: { userId: session.userId }, data: { isPublic } })

  revalidatePath('/media-kit')
  revalidatePath(`/m/${existing.slug}`)
  return { success: true, data: undefined }
}
