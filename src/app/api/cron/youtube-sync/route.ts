import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { syncRevenueForUser } from '@/lib/youtube'
import { verifyCronAuth } from '@/lib/cron-auth'

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const connections = await db.youTubeConnection.findMany({ select: { userId: true } })

  let synced = 0
  const errors: string[] = []

  for (const conn of connections) {
    try {
      await syncRevenueForUser(conn.userId)
      synced++
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown'
      errors.push(`${conn.userId}: ${message}`)
    }
  }

  return NextResponse.json({ synced, checked: connections.length, errors })
}
