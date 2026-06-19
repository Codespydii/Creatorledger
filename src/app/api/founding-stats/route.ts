import { NextResponse } from 'next/server'
import { getFoundingStats } from '@/lib/beta'

// Always read the live count from the DB and never cache the response, so the
// homepage (which is now fully static) can show a real-time "spots left" number
// fetched on the client.
export const dynamic = 'force-dynamic'

export async function GET() {
  const stats = await getFoundingStats()
  return NextResponse.json(stats, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
