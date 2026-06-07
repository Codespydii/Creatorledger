import { notFound } from 'next/navigation'
import { Users, MailCheck, MailWarning, CheckCircle2 } from 'lucide-react'
import { verifySession } from '@/lib/session'
import { isAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
import { CopyEmailsButton } from './copy-emails-button'

// Admin data must never be cached — always read live.
export const dynamic = 'force-dynamic'

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

export default async function SpiralAdminPage() {
  const session = await verifySession() // redirects to /login when signed out

  // Gate: only allow-listed emails. Everyone else gets a 404 (page existence hidden).
  if (!isAdmin(session.email)) {
    notFound()
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      emailVerifiedAt: true,
      onboardedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const total = users.length
  const verified = users.filter((u) => u.emailVerifiedAt).length
  const unverified = total - verified
  const onboarded = users.filter((u) => u.onboardedAt).length

  const verifiedEmails = users
    .filter((u) => u.emailVerifiedAt)
    .map((u) => u.email)

  const stats = [
    { label: 'Total signups', value: total, icon: Users, tone: 'text-foreground' },
    { label: 'Verified', value: verified, icon: MailCheck, tone: 'text-emerald-600' },
    { label: 'Unverified', value: unverified, icon: MailWarning, tone: 'text-amber-600' },
    { label: 'Onboarded', value: onboarded, icon: CheckCircle2, tone: 'text-violet-600' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Admin · Signups</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {session.email}. Live view of everyone who&apos;s registered.
          </p>
        </header>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Icon className="h-4 w-4" />
                {label}
              </div>
              <p className={`mt-2 text-3xl font-bold tabular-nums ${tone}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Verified email export */}
        <div className="mb-8 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Verified emails ({verifiedEmails.length})</h2>
              <p className="text-xs text-muted-foreground">
                Comma-separated. Only verified addresses — safe to import into a Resend Audience.
              </p>
            </div>
            <CopyEmailsButton emails={verifiedEmails} />
          </div>
        </div>

        {/* Users table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Onboarded</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      No signups yet.
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{u.name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {u.emailVerifiedAt ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {fmtDate(u.emailVerifiedAt)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.onboardedAt ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
