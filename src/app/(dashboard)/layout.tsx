import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { Sidebar } from '@/components/shared/sidebar'
import { VerifyEmailBanner } from '@/components/shared/verify-email-banner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true, emailVerifiedAt: true },
  })
  const needsVerification = user && !user.emailVerifiedAt

  return (
    <div className="flex h-screen bg-muted overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {needsVerification && <VerifyEmailBanner email={user.email} />}
        {children}
      </div>
    </div>
  )
}
