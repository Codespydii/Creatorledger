import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/shared/dashboard-shell'
import { VerifyEmailBanner } from '@/components/shared/verify-email-banner'
import { GuidedTour, CAELO_TOUR_STEPS } from '@/components/tour'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true, emailVerifiedAt: true },
  })
  const needsVerification = user && !user.emailVerifiedAt

  return (
    <DashboardShell banner={needsVerification ? <VerifyEmailBanner email={user.email} /> : null}>
      {children}
      <GuidedTour steps={CAELO_TOUR_STEPS} />
    </DashboardShell>
  )
}
