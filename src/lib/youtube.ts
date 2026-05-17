import 'server-only'
import { db } from './db'
import { sealSecret, openSecret } from './crypto-seal'
import { dollarsToCents } from './utils'
import type { YouTubeConnection } from '@/generated/prisma/models'

export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
]

export class YouTubeConfigError extends Error {
  constructor() {
    super('Google OAuth is not configured. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.')
    this.name = 'YouTubeConfigError'
  }
}

export class YouTubeApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'YouTubeApiError'
  }
}

export function isYoutubeConfigured(): boolean {
  return Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET)
}

export function getRedirectUri(): string {
  if (process.env.GOOGLE_OAUTH_REDIRECT_URI) return process.env.GOOGLE_OAUTH_REDIRECT_URI
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/api/oauth/youtube/callback`
}

export function buildAuthUrl(state: string): string {
  if (!isYoutubeConfigured()) throw new YouTubeConfigError()
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: YOUTUBE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  if (!isYoutubeConfigured()) throw new YouTubeConfigError()

  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    redirect_uri: getRedirectUri(),
    grant_type: 'authorization_code',
  })

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new YouTubeApiError(res.status, `Token exchange failed: ${text.slice(0, 200)}`)
  }
  return (await res.json()) as TokenResponse
}

async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  if (!isYoutubeConfigured()) throw new YouTubeConfigError()

  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new YouTubeApiError(res.status, `Token refresh failed: ${text.slice(0, 200)}`)
  }
  return (await res.json()) as TokenResponse
}

export async function revokeToken(token: string): Promise<void> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    if (!res.ok) {
      console.warn(`YouTube token revoke returned ${res.status}`)
    }
  } catch (err) {
    console.warn('YouTube token revoke failed:', err instanceof Error ? err.name : 'unknown')
  }
}

async function ensureFreshToken(conn: YouTubeConnection): Promise<string> {
  const skewMs = 60_000
  if (conn.tokenExpiresAt.getTime() > Date.now() + skewMs) {
    return openSecret(conn.accessToken)
  }
  const refreshToken = openSecret(conn.refreshToken)
  const refreshed = await refreshAccessToken(refreshToken)
  const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000)
  await db.youTubeConnection.update({
    where: { id: conn.id },
    data: {
      accessToken: sealSecret(refreshed.access_token),
      tokenExpiresAt: expiresAt,
    },
  })
  return refreshed.access_token
}

export interface ChannelInfo {
  channelId: string
  channelTitle: string
  channelThumb: string | null
  subscriberCount: number | null
  totalViews: bigint | null
}

export async function fetchChannelInfo(accessToken: string): Promise<ChannelInfo> {
  const res = await fetch(
    'https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new YouTubeApiError(res.status, `Channel info failed: ${text.slice(0, 200)}`)
  }
  const data = (await res.json()) as {
    items?: Array<{
      id: string
      snippet: { title: string; thumbnails?: { default?: { url?: string }; medium?: { url?: string } } }
      statistics: { subscriberCount?: string; viewCount?: string }
    }>
  }
  const item = data.items?.[0]
  if (!item) throw new YouTubeApiError(404, 'No YouTube channel found on this account.')

  const subs = item.statistics.subscriberCount ? parseInt(item.statistics.subscriberCount, 10) : null
  const views = item.statistics.viewCount ? BigInt(item.statistics.viewCount) : null
  const thumb = item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? null

  return {
    channelId: item.id,
    channelTitle: item.snippet.title,
    channelThumb: thumb,
    subscriberCount: subs,
    totalViews: views,
  }
}

interface DailyRevenueRow {
  day: string
  estimatedRevenue: number
}

async function fetchDailyRevenue(accessToken: string, startDate: string, endDate: string): Promise<DailyRevenueRow[]> {
  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate,
    endDate,
    metrics: 'estimatedRevenue',
    dimensions: 'day',
  })
  const res = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new YouTubeApiError(res.status, `Analytics fetch failed: ${text.slice(0, 200)}`)
  }
  const data = (await res.json()) as { rows?: Array<[string, number]> }
  if (!data.rows) return []
  return data.rows.map(([day, estimatedRevenue]) => ({ day, estimatedRevenue }))
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function isoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

function monthLabel(year: number, monthIndex: number): string {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export interface SyncResult {
  inserted: number
  updated: number
  skipped: number
}

export async function syncRevenueForUser(userId: string): Promise<SyncResult> {
  const conn = await db.youTubeConnection.findUnique({ where: { userId } })
  if (!conn) throw new Error('YouTube is not connected.')

  let accessToken: string
  try {
    accessToken = await ensureFreshToken(conn)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token refresh failed'
    await db.youTubeConnection.update({
      where: { id: conn.id },
      data: { lastSyncStatus: 'error', lastSyncError: message, lastSyncedAt: new Date() },
    })
    throw err
  }

  const now = new Date()
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2))
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1))

  let dailyRows: DailyRevenueRow[]
  try {
    dailyRows = await fetchDailyRevenue(accessToken, isoDate(startDate), isoDate(endDate))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analytics fetch failed'
    await db.youTubeConnection.update({
      where: { id: conn.id },
      data: { lastSyncStatus: 'error', lastSyncError: message, lastSyncedAt: new Date() },
    })
    throw err
  }

  const monthlyTotals = new Map<string, number>()
  for (const row of dailyRows) {
    const monthKey = row.day.slice(0, 7)
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) ?? 0) + row.estimatedRevenue)
  }

  const candidateRefs = Array.from(monthlyTotals.keys()).map(
    (monthKey) => `youtube:${conn.channelId}:${monthKey}`,
  )
  const existingRefs = new Set(
    (
      await db.revenueEntry.findMany({
        where: { userId, externalRef: { in: candidateRefs } },
        select: { externalRef: true },
      })
    )
      .map((r) => r.externalRef)
      .filter((r): r is string => r !== null),
  )

  let inserted = 0
  let updated = 0
  let skipped = 0

  for (const [monthKey, total] of monthlyTotals) {
    if (total <= 0) {
      skipped++
      continue
    }
    const externalRef = `youtube:${conn.channelId}:${monthKey}`
    const [yearStr, monthStr] = monthKey.split('-')
    const year = parseInt(yearStr, 10)
    const monthIndex = parseInt(monthStr, 10) - 1
    const firstOfMonth = new Date(Date.UTC(year, monthIndex, 1))
    const amountCents = dollarsToCents(total)
    const label = monthLabel(year, monthIndex)
    const description = `AdSense — ${label}`
    const wasExisting = existingRefs.has(externalRef)

    await db.revenueEntry.upsert({
      where: { userId_externalRef: { userId, externalRef } },
      update: { amountCents, date: firstOfMonth, description },
      create: {
        userId,
        source: 'adsense',
        amountCents,
        currency: 'USD',
        description,
        platform: 'YouTube',
        date: firstOfMonth,
        externalRef,
      },
    })

    if (wasExisting) updated++
    else inserted++
  }

  await db.youTubeConnection.update({
    where: { id: conn.id },
    data: { lastSyncStatus: 'ok', lastSyncError: null, lastSyncedAt: new Date() },
  })

  return { inserted, updated, skipped }
}

export async function autofillMediaKitFromChannel(userId: string, info: ChannelInfo): Promise<void> {
  const mk = await db.mediaKit.findUnique({ where: { userId } })
  if (!mk) return
  const data: Record<string, unknown> = {}
  if (mk.subscriberCount == null && info.subscriberCount != null) data.subscriberCount = info.subscriberCount
  if (mk.totalViews == null && info.totalViews != null) data.totalViews = info.totalViews
  if (Object.keys(data).length === 0) return
  await db.mediaKit.update({ where: { userId }, data })
}
