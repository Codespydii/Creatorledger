import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { OnboardingWizard } from './wizard'

export const metadata = {
  title: 'Welcome — Caelo',
  description: 'Three quick questions so we can tailor your dashboard.',
}

export default async function OnboardingPage() {
  const session = await verifySession()
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, onboardedAt: true },
  })

  if (!user) redirect('/login')
  if (user.onboardedAt) redirect('/dashboard')

  return <OnboardingWizard userName={user.name} />
}
