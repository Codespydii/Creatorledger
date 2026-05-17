import Link from 'next/link'
import { db } from '@/lib/db'
import { createHash } from 'crypto'
import { ResetPasswordForm } from '@/components/features/auth/reset-password-form'

interface Props {
  params: Promise<{ token: string }>
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export default async function ResetPasswordPage({ params }: Props) {
  const { token } = await params
  const tokenHash = hashToken(token)

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { usedAt: true, expiresAt: true },
  })

  const invalid = !record || record.usedAt !== null || record.expiresAt < new Date()

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary mb-4">
            <span className="text-white font-bold text-lg">CL</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {invalid ? 'Link expired' : 'Choose a new password'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {invalid
              ? 'This reset link is no longer valid.'
              : 'Pick a password you haven’t used before.'}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          {invalid ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Reset links expire after 60 minutes and can only be used once.
              </p>
              <Link
                href="/forgot-password"
                className="mt-4 inline-block text-sm text-primary font-medium hover:underline"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <ResetPasswordForm token={token} />
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
