'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { syncRevenueForUser, revokeToken } from '@/lib/youtube'
import { openSecret } from '@/lib/crypto-seal'
import type { ActionState } from '@/types'

export async function syncYoutubeNow(
  _state: ActionState<{ inserted: number; updated: number; skipped: number }>,
): Promise<ActionState<{ inserted: number; updated: number; skipped: number }>> {
  const session = await verifySession()
  try {
    const result = await syncRevenueForUser(session.userId)
    revalidatePath('/settings')
    revalidatePath('/revenue')
    revalidatePath('/dashboard')
    revalidatePath('/forecast')
    return { success: true, data: result }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed.'
    return { success: false, error: message }
  }
}

export async function disconnectYoutube(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession()
  const deleteRevenue = formData.get('deleteRevenue') === 'true'

  const conn = await db.youTubeConnection.findUnique({ where: { userId: session.userId } })
  if (!conn) return { success: false, error: 'No YouTube connection found.' }

  await revokeToken(openSecret(conn.refreshToken))
  await db.youTubeConnection.delete({ where: { userId: session.userId } })

  if (deleteRevenue) {
    await db.revenueEntry.deleteMany({
      where: { userId: session.userId, externalRef: { startsWith: 'youtube:' } },
    })
  }

  revalidatePath('/settings')
  revalidatePath('/revenue')
  revalidatePath('/dashboard')
  revalidatePath('/forecast')
  redirect('/settings?youtube=disconnected')
}
