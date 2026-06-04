import { Topbar } from '@/components/shared/topbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ProfileForm } from '@/components/features/settings/profile-form'
import { PasswordForm } from '@/components/features/settings/password-form'
import { DeleteAccount } from '@/components/features/settings/delete-account'
import { StripeSettings } from '@/components/features/settings/stripe-settings'
import { YoutubeSettings } from '@/components/features/settings/youtube-settings'
import { SettingsNav } from '@/components/features/settings/settings-nav'
import { SampleDataButton } from '@/components/features/dashboard/sample-data-button'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { isYoutubeConfigured } from '@/lib/youtube'

const YOUTUBE_STATUS_BANNERS: Record<string, { tone: 'success' | 'error'; message: string }> = {
  connected: { tone: 'success', message: 'YouTube connected. Your AdSense revenue will sync daily.' },
  disconnected: { tone: 'success', message: 'YouTube disconnected.' },
  denied: { tone: 'error', message: 'YouTube connection cancelled.' },
  missing_scope: { tone: 'error', message: 'Connection failed: revenue scope was not granted. Try again and accept all permissions.' },
  missing_refresh: { tone: 'error', message: 'Connection failed: Google did not return a refresh token. Revoke access in your Google Account and retry.' },
  error: { tone: 'error', message: 'Something went wrong connecting YouTube. Please try again.' },
}

const YOUTUBE_ERROR_DETAILS: Record<string, string> = {
  missing_params: 'Google sent us back without an authorization code.',
  bad_state: 'Sign-in request expired (>10 minutes). Try again.',
  user_mismatch: 'Session user does not match the OAuth state. Sign out and try again.',
  exchange_failed: 'Could not exchange the code with Google. Check server logs.',
  invalid_credentials: 'Server OAuth credentials were rejected by Google.',
  channel_fetch_failed: 'Could not fetch channel info from YouTube.',
  api_not_enabled: 'YouTube Data API v3 is not enabled in your Google Cloud project.',
  no_channel: 'This Google account does not have a YouTube channel.',
  token_rejected: 'The access token was rejected when fetching channel info.',
  db_or_seal: 'Could not save the connection to the database.',
  google_redirect_uri_mismatch: 'YouTube redirect URI is not registered in Google Console.',
  google_invalid_client: 'Client ID is not recognized by Google.',
  google_access_denied: 'Access was denied.',
}

interface Props {
  searchParams: Promise<{ youtube?: string; detail?: string }>
}

export default async function SettingsPage({ searchParams }: Props) {
  const session = await verifySession()
  const sp = await searchParams

  const [user, ytConn, importedRowCount, sampleCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, channelName: true, platform: true, defaultCurrency: true, niche: true, businessAddress: true, ein: true, website: true, createdAt: true, stripeKey: true },
    }),
    db.youTubeConnection.findUnique({ where: { userId: session.userId } }),
    db.revenueEntry.count({
      where: { userId: session.userId, externalRef: { startsWith: 'youtube:' } },
    }),
    db.revenueEntry.count({
      where: { userId: session.userId, description: { contains: '[SAMPLE]' } },
    }),
  ])

  const baseBanner = sp.youtube ? YOUTUBE_STATUS_BANNERS[sp.youtube] : null
  const detailNote = sp.detail ? YOUTUBE_ERROR_DETAILS[sp.detail] ?? sp.detail : null
  const banner = baseBanner && detailNote
    ? { ...baseBanner, message: `${baseBanner.message} (${detailNote})` }
    : baseBanner

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Settings" subtitle="Manage your account preferences" />
      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto flex w-full max-w-5xl gap-8">
          <aside className="w-44 shrink-0">
            <SettingsNav />
          </aside>

          <div className="min-w-0 flex-1 max-w-2xl space-y-6">
            {banner && (
              <div
                role="status"
                className={`rounded-lg border px-4 py-3 text-sm ${
                  banner.tone === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300'
                    : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300'
                }`}
              >
                {banner.message}
              </div>
            )}

            <section id="profile" className="scroll-mt-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Update your display name, creator details, and the business info shown on your invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm
                    name={user?.name ?? ''}
                    channelName={user?.channelName ?? ''}
                    platform={user?.platform ?? ''}
                    defaultCurrency={user?.defaultCurrency ?? 'USD'}
                    niche={user?.niche ?? ''}
                    businessAddress={user?.businessAddress ?? ''}
                    ein={user?.ein ?? ''}
                    website={user?.website ?? ''}
                  />
                </CardContent>
              </Card>
            </section>

            <section id="account" className="scroll-mt-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Your login email. Cannot be changed.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3 gap-3">
                    <span className="text-sm text-foreground truncate">{user?.email}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      Member since {user?.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="integrations" className="scroll-mt-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>YouTube</CardTitle>
                  <CardDescription>Auto-import AdSense revenue and channel stats.</CardDescription>
                </CardHeader>
                <CardContent>
                  <YoutubeSettings
                    connected={Boolean(ytConn)}
                    configured={isYoutubeConfigured()}
                    channelTitle={ytConn?.channelTitle ?? null}
                    channelThumb={ytConn?.channelThumb ?? null}
                    subscriberCount={ytConn?.subscriberCount ?? null}
                    totalViews={ytConn?.totalViews != null ? Number(ytConn.totalViews) : null}
                    lastSyncedAt={ytConn?.lastSyncedAt?.toISOString() ?? null}
                    lastSyncStatus={ytConn?.lastSyncStatus ?? null}
                    lastSyncError={ytConn?.lastSyncError ?? null}
                    importedRowCount={importedRowCount}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>Connect Stripe to add one-click pay links to your invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                  <StripeSettings hasKey={!!user?.stripeKey} />
                </CardContent>
              </Card>
            </section>

            <section id="security" className="scroll-mt-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Use a strong password of at least 8 characters.</CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordForm />
                </CardContent>
              </Card>
            </section>

            <section id="data" className="scroll-mt-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sample data</CardTitle>
                  <CardDescription>
                    Load fake revenue, expenses, deals, and invoices to explore the product. Tagged as &ldquo;sample&rdquo; so you can wipe it cleanly at any time. Your real entries are never touched.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SampleDataButton hasSample={sampleCount > 0} variant="button" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export your data</CardTitle>
                  <CardDescription>
                    Download a JSON file containing every row you own — revenues, expenses, invoices, deals, contracts, media kit, rate benchmarks. Sensitive credentials are excluded.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href="/api/me/export"
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    Download my data (JSON)
                  </a>
                </CardContent>
              </Card>
            </section>

            <section id="danger" className="scroll-mt-24 space-y-6">
              <Card className="border-destructive/40">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DeleteAccount />
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
