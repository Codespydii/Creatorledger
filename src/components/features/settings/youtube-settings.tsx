'use client'

import { useActionState, useEffect, useState } from 'react'
import Image from 'next/image'
import { Video, RefreshCcw, Unplug, CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react'
import { syncYoutubeNow, disconnectYoutube } from '@/app/actions/youtube'
import { Button } from '@/components/ui/button'
import { useEscapeKey } from '@/hooks/use-escape-key'

interface Props {
  connected: boolean
  configured: boolean
  channelTitle?: string | null
  channelThumb?: string | null
  subscriberCount?: number | null
  totalViews?: number | null
  lastSyncedAt?: string | null
  lastSyncStatus?: string | null
  lastSyncError?: string | null
  importedRowCount?: number
}

function formatBigNumber(n: number | null | undefined): string | null {
  if (n == null) return null
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'never'
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function YoutubeSettings(props: Props) {
  const {
    connected,
    configured,
    channelTitle,
    channelThumb,
    subscriberCount,
    totalViews,
    lastSyncedAt,
    lastSyncStatus,
    lastSyncError,
    importedRowCount = 0,
  } = props

  const [syncState, syncAction, syncing] = useActionState(syncYoutubeNow, undefined)
  const [, disconnectAction, disconnecting] = useActionState(disconnectYoutube, undefined)
  const [showDisconnect, setShowDisconnect] = useState(false)
  useEscapeKey(() => setShowDisconnect(false), showDisconnect)
  const [deleteRows, setDeleteRows] = useState(false)

  useEffect(() => {
    if (syncState?.success) {
      setShowDisconnect(false)
    }
  }, [syncState])

  if (!configured) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">YouTube sync is not configured</p>
            <p className="mt-1 text-amber-700">
              Add <code className="font-mono text-xs">GOOGLE_OAUTH_CLIENT_ID</code> and <code className="font-mono text-xs">GOOGLE_OAUTH_CLIENT_SECRET</code> to your <code className="font-mono text-xs">.env.local</code>, then restart the dev server. See Google Cloud Console → Credentials → OAuth Client ID (Web application) and add{' '}
              <code className="font-mono text-xs">http://localhost:3000/api/oauth/youtube/callback</code> as an authorized redirect URI.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 shrink-0">
          <Video className="h-6 w-6 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Connect your YouTube channel</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll pull AdSense revenue monthly and add it to your Revenue tab automatically.
          </p>

          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-semibold text-foreground mb-1.5">Before you click — what Google will ask for:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong className="font-medium text-foreground">Read-only access</strong> to your channel info and AdSense revenue. We can&apos;t post, edit, or delete anything.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Google will mark this as &quot;sensitive&quot; — that&apos;s their wording for revenue access, not a warning about us.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Your tokens are encrypted at rest. Disconnect any time — we&apos;ll revoke our access immediately.</span>
              </li>
            </ul>
          </div>

          <a
            href="/api/oauth/youtube/start"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            <Video className="h-4 w-4" /> Connect YouTube
          </a>
        </div>
      </div>
    )
  }

  const subs = formatBigNumber(subscriberCount)
  const views = formatBigNumber(totalViews)

  return (
    <div className="space-y-4">
      {syncState?.success && syncState.data && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Synced — {syncState.data.inserted} added, {syncState.data.updated} updated, {syncState.data.skipped} skipped.
        </div>
      )}
      {syncState && !syncState.success && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{syncState.error}</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {channelThumb ? (
          <Image
            src={channelThumb}
            alt={channelTitle ?? 'Channel'}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full border border-border shrink-0"
            unoptimized
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 shrink-0">
            <Video className="h-6 w-6 text-red-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{channelTitle}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {subs ? `${subs} subscribers` : null}
            {subs && views ? ' · ' : null}
            {views ? `${views} total views` : null}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last synced {timeAgo(lastSyncedAt)}
            {importedRowCount > 0 ? ` · ${importedRowCount} month${importedRowCount === 1 ? '' : 's'} imported` : ''}
            {lastSyncStatus === 'error' && lastSyncError ? ` · error: ${lastSyncError}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <form action={syncAction}>
          <Button type="submit" variant="outline" disabled={syncing}>
            {syncing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Syncing…</>
            ) : (
              <><RefreshCcw className="h-4 w-4" /> Sync now</>
            )}
          </Button>
        </form>
        <Button variant="ghost" onClick={() => setShowDisconnect(true)}>
          <Unplug className="h-4 w-4" /> Disconnect
        </Button>
      </div>

      {showDisconnect && (
        <div role="dialog" aria-modal="true" aria-labelledby="disconnect-yt-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 id="disconnect-yt-title" className="text-lg font-semibold text-foreground">Disconnect YouTube?</h2>
              <button onClick={() => setShowDisconnect(false)} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              You can keep the AdSense revenue rows that were imported, or delete them along with the connection.
            </p>
            <form action={disconnectAction} className="space-y-4">
              <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={deleteRows}
                  onChange={(e) => setDeleteRows(e.currentTarget.checked)}
                />
                <span className="text-sm text-foreground">
                  Also delete imported AdSense revenue rows
                  {importedRowCount > 0 ? <span className="text-muted-foreground"> ({importedRowCount} {importedRowCount === 1 ? 'entry' : 'entries'})</span> : null}
                </span>
              </label>
              <input type="hidden" name="deleteRevenue" value={deleteRows ? 'true' : 'false'} />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDisconnect(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" className="flex-1" disabled={disconnecting}>
                  {disconnecting ? 'Disconnecting…' : 'Disconnect'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
