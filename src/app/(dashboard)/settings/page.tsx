import { Topbar } from '@/components/shared/topbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ProfileForm } from '@/components/features/settings/profile-form'
import { PasswordForm } from '@/components/features/settings/password-form'
import { DeleteAccount } from '@/components/features/settings/delete-account'
import { StripeSettings } from '@/components/features/settings/stripe-settings'
import { YoutubeSettings } from '@/components/features/settings/youtube-settings'
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

interface Props {
  searchParams: Promise<{ youtube?: string }>
}

export default async function SettingsPage({ searchParams }: Props) {
  const session = await verifySession()
  const sp = await searchParams

  const [user, ytConn, importedRowCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, channelName: true, platform: true, defaultCurrency: true, createdAt: true, stripeKey: true },
    }),
    db.youTubeConnection.findUnique({ where: { userId: session.userId } }),
    db.revenueEntry.count({
      where: { userId: session.userId, externalRef: { startsWith: 'youtube:' } },
    }),
  ])

  const banner = sp.youtube ? YOUTUBE_STATUS_BANNERS[sp.youtube] : null

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Settings" subtitle="Manage your account preferences" />
      <main className="flex-1 p-6 space-y-6 max-w-2xl">

        {banner && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              banner.tone === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {banner.message}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your display name and creator details.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              name={user?.name ?? ''}
              channelName={user?.channelName ?? ''}
              platform={user?.platform ?? ''}
              defaultCurrency={user?.defaultCurrency ?? 'USD'}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your login email. Cannot be changed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
              <span className="text-sm text-foreground">{user?.email}</span>
              <span className="text-xs text-muted-foreground">
                Member since {user?.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </CardContent>
        </Card>

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
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Use a strong password of at least 8 characters.</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
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

      </main>
    </div>
  )
}
