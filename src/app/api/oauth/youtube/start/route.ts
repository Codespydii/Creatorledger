import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { buildAuthUrl, isYoutubeConfigured } from '@/lib/youtube'
import { signOAuthState } from '@/lib/oauth-state'

export async function GET() {
  if (!isYoutubeConfigured()) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured on the server.' },
      { status: 500 },
    )
  }
  const session = await verifySession()
  const state = await signOAuthState(session.userId, 'youtube')
  const authUrl = buildAuthUrl(state)
  redirect(authUrl)
}
