import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { verifyOAuthState } from '@/lib/oauth-state'
import { sealSecret } from '@/lib/crypto-seal'
import {
  exchangeCodeForTokens,
  fetchChannelInfo,
  autofillMediaKitFromChannel,
  YOUTUBE_SCOPES,
  YouTubeApiError,
} from '@/lib/youtube'

function redirectTo(req: NextRequest, status: string, detail?: string): NextResponse {
  const url = new URL('/settings', req.url)
  url.searchParams.set('youtube', status)
  if (detail) url.searchParams.set('detail', detail)
  return NextResponse.redirect(url)
}

function logFailure(label: string, err: unknown) {
  const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
  if (err instanceof Error && err.stack) {
    console.error(`[youtube-oauth] ${label}\n${err.stack}`)
  } else {
    console.error(`[youtube-oauth] ${label} — ${message}`)
  }
  import('@sentry/nextjs').then(s => {
    if (err instanceof Error) s.captureException(err, { tags: { route: 'youtube-callback', step: label } })
    else s.captureMessage(`youtube-oauth ${label}: ${message}`, 'error')
  }).catch(() => {})
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const oauthError = req.nextUrl.searchParams.get('error')
  const oauthErrorDesc = req.nextUrl.searchParams.get('error_description')

  if (oauthError === 'access_denied') return redirectTo(req, 'denied')
  if (oauthError) {
    console.error(`[youtube-oauth] Google returned error=${oauthError} description="${oauthErrorDesc ?? ''}"`)
    return redirectTo(req, 'error', `google_${oauthError}`)
  }
  if (!code || !state) {
    console.error('[youtube-oauth] missing code or state')
    return redirectTo(req, 'error', 'missing_params')
  }

  const verified = await verifyOAuthState(state, 'youtube')
  if (!verified) {
    console.error('[youtube-oauth] state JWT failed to verify')
    return redirectTo(req, 'error', 'bad_state')
  }

  const session = await verifySession()
  if (session.userId !== verified.userId) {
    console.error('[youtube-oauth] session user does not match state user')
    return redirectTo(req, 'error', 'user_mismatch')
  }

  let tokens
  try {
    tokens = await exchangeCodeForTokens(code)
  } catch (err) {
    logFailure('exchange_tokens', err)
    let detail = 'exchange_failed'
    if (err instanceof YouTubeApiError && (err.status === 401 || err.status === 403)) {
      detail = 'invalid_credentials'
    }
    return redirectTo(req, 'error', detail)
  }

  const grantedScopes = (tokens.scope ?? '').split(/\s+/)
  const hasAllScopes = YOUTUBE_SCOPES.every((s) => grantedScopes.includes(s))
  if (!hasAllScopes) {
    console.error(`[youtube-oauth] missing required scopes — granted: ${grantedScopes.join(', ')}`)
    return redirectTo(req, 'missing_scope')
  }
  if (!tokens.refresh_token) {
    console.error('[youtube-oauth] Google did not return a refresh_token')
    return redirectTo(req, 'missing_refresh')
  }

  let channel
  try {
    channel = await fetchChannelInfo(tokens.access_token)
  } catch (err) {
    logFailure('fetch_channel', err)
    let detail = 'channel_fetch_failed'
    if (err instanceof YouTubeApiError) {
      if (err.status === 403) detail = 'api_not_enabled'        // YouTube Data API not enabled
      else if (err.status === 404) detail = 'no_channel'         // Google account has no YT channel
      else if (err.status === 401) detail = 'token_rejected'
    }
    return redirectTo(req, 'error', detail)
  }

  try {
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
    logFailure('db_or_seal', err)
    return redirectTo(req, 'error', 'db_or_seal')
  }
}
