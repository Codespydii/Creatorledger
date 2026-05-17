import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { verifyOAuthState } from '@/lib/oauth-state'
import { sealSecret } from '@/lib/crypto-seal'
import {
  exchangeCodeForTokens,
  fetchChannelInfo,
  autofillMediaKitFromChannel,
  YOUTUBE_SCOPES,
} from '@/lib/youtube'

function redirectTo(req: NextRequest, status: string): NextResponse {
  const url = new URL('/settings', req.url)
  url.searchParams.set('youtube', status)
  return NextResponse.redirect(url)
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code || !state) {
    return redirectTo(req, 'denied')
  }

  const verified = await verifyOAuthState(state, 'youtube')
  if (!verified) return redirectTo(req, 'error')

  const session = await verifySession()
  if (session.userId !== verified.userId) return redirectTo(req, 'error')

  try {
    const tokens = await exchangeCodeForTokens(code)
    const grantedScopes = (tokens.scope ?? '').split(/\s+/)
    const hasAllScopes = YOUTUBE_SCOPES.every((s) => grantedScopes.includes(s))
    if (!hasAllScopes) return redirectTo(req, 'missing_scope')
    if (!tokens.refresh_token) return redirectTo(req, 'missing_refresh')

    const channel = await fetchChannelInfo(tokens.access_token)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
    const sealedAccess = sealSecret(tokens.access_token)
    const sealedRefresh = sealSecret(tokens.refresh_token)

    await db.youTubeConnection.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        channelId: channel.channelId,
        channelTitle: channel.channelTitle,
        channelThumb: channel.channelThumb,
        subscriberCount: channel.subscriberCount,
        totalViews: channel.totalViews,
        scope: tokens.scope,
        accessToken: sealedAccess,
        refreshToken: sealedRefresh,
        tokenExpiresAt: expiresAt,
      },
      update: {
        channelId: channel.channelId,
        channelTitle: channel.channelTitle,
        channelThumb: channel.channelThumb,
        subscriberCount: channel.subscriberCount,
        totalViews: channel.totalViews,
        scope: tokens.scope,
        accessToken: sealedAccess,
        refreshToken: sealedRefresh,
        tokenExpiresAt: expiresAt,
        lastSyncStatus: null,
        lastSyncError: null,
      },
    })

    await autofillMediaKitFromChannel(session.userId, channel)

    return redirectTo(req, 'connected')
  } catch (err) {
    console.error('YouTube OAuth callback failed:', err)
    return redirectTo(req, 'error')
  }
}
