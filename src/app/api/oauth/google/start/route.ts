import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { buildSignInAuthUrl, isGoogleSignInConfigured } from '@/lib/google-signin'
import { signSignInState } from '@/lib/oauth-state'

export async function GET() {
  if (!isGoogleSignInConfigured()) {
    return NextResponse.json(
      { error: 'Google Sign-In is not configured on the server.' },
      { status: 500 },
    )
  }
  const state = await signSignInState('google')
  const authUrl = buildSignInAuthUrl(state)
  redirect(authUrl)
}
