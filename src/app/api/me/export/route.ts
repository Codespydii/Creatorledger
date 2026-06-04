import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'

/**
 * GDPR / right-to-data-portability export.
 * Returns every row this user owns as a single downloadable JSON file.
 * Sensitive fields (passwordHash, encrypted OAuth tokens, Stripe keys)
 * are excluded — they are credentials, not user data.
 *
 * Big integers (e.g. MediaKit.totalViews) are serialized as strings to
 * keep the JSON valid.
 */

function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString()
  return value
}

export async function GET() {
  const session = await verifySession()
  const userId = session.userId

  const [user, revenues, expenses, invoices, deals, contracts, mediaKit, benchmarks, youtubeMeta] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true,
        avatarUrl: true, channelName: true, platform: true,
        defaultCurrency: true, primaryPlatform: true,
        audienceTier: true, primaryPain: true,
        onboardedAt: true, emailVerifiedAt: true,
        createdAt: true, updatedAt: true,
      },
    }),
    db.revenueEntry.findMany({ where: { userId } }),
    db.expense.findMany({ where: { userId } }),
    db.invoice.findMany({ where: { userId }, include: { items: true } }),
    db.deal.findMany({ where: { userId } }),
    db.contract.findMany({ where: { userId } }),
    db.mediaKit.findUnique({ where: { userId } }),
    db.rateBenchmark.findMany({ where: { userId } }),
    db.youTubeConnection.findUnique({
      where: { userId },
      select: {
        channelId: true, channelTitle: true,
        subscriberCount: true, totalViews: true,
        connectedAt: true, lastSyncedAt: true,
        // accessToken / refreshToken intentionally omitted (encrypted secrets)
      },
    }),
  ])

  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      note: 'This is your complete user data from Caelo. Sensitive credentials (password hash, OAuth tokens, payment-provider keys) are intentionally omitted.',
      format: 'JSON',
      schema_version: 1,
    },
    user,
    revenue_entries: revenues,
    expenses,
    invoices,
    deals,
    contracts,
    media_kit: mediaKit,
    rate_benchmarks: benchmarks,
    youtube_connection: youtubeMeta,
  }

  const body = JSON.stringify(exportData, jsonReplacer, 2)
  const filename = `creator-ledger-export-${new Date().toISOString().split('T')[0]}.json`

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
