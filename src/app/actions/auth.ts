'use server'

import { redirect } from 'next/navigation'
import { createHash, randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { SignupSchema, LoginSchema } from '@/lib/validations/auth'
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail, isEmailConfigured } from '@/lib/email'
import { rateLimit, rateLimitErrorMessage, LIMITS } from '@/lib/rate-limit'
import type { ActionState } from '@/types'

const RESET_TOKEN_TTL_MINUTES = 60
const VERIFY_TOKEN_TTL_HOURS = 24

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return url.replace(/\/$/, '')
}

export async function signup(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const result = SignupSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: 'Validation failed', fieldErrors: result.error.flatten().fieldErrors }
  }

  const limited = await rateLimit(LIMITS.signup)
  if (!limited.ok) return { success: false, error: rateLimitErrorMessage(limited) }

  const { name, email, password } = result.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return { success: false, error: 'An account with this email already exists', fieldErrors: { email: ['Email already in use'] } }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await db.user.create({
    data: { name, email, passwordHash: hashedPassword },
  })

  // Fire-and-forget emails (welcome + verification). Don't block signup if Resend isn't configured.
  if (isEmailConfigured()) {
    const rawVerifyToken = randomBytes(32).toString('hex')
    const verifyTokenHash = hashToken(rawVerifyToken)
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_HOURS * 60 * 60 * 1000)
    await db.emailVerificationToken.create({
      data: { userId: user.id, tokenHash: verifyTokenHash, expiresAt },
    })
    const verifyUrl = `${getAppUrl()}/verify-email/${rawVerifyToken}`
    const dashboardUrl = `${getAppUrl()}/dashboard`

    Promise.allSettled([
      sendVerificationEmail({
        toEmail: user.email, toName: user.name,
        verifyUrl, expiresInHours: VERIFY_TOKEN_TTL_HOURS,
      }),
      sendWelcomeEmail({
        toEmail: user.email, toName: user.name,
        dashboardUrl,
      }),
    ]).then((results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          const label = i === 0 ? 'verification' : 'welcome'
          console.error(`Signup ${label} email failed:`, r.reason instanceof Error ? r.reason.message : r.reason)
        }
      })
    })
  }

  await createSession(user.id, user.email)
  redirect('/onboarding')
}

const VerifyEmailSchema = z.object({
  token: z.string().min(32),
})

export async function verifyEmail(token: string): Promise<{ ok: boolean; error?: string }> {
  const result = VerifyEmailSchema.safeParse({ token })
  if (!result.success) return { ok: false, error: 'Invalid token' }

  const tokenHash = hashToken(token)
  const row = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, emailVerifiedAt: true } } },
  })
  if (!row) return { ok: false, error: 'Token not found' }
  if (row.usedAt) return { ok: false, error: 'Token already used' }
  if (row.expiresAt < new Date()) return { ok: false, error: 'Token expired' }

  if (row.user.emailVerifiedAt) {
    return { ok: true }
  }

  await db.$transaction([
    db.emailVerificationToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    db.user.update({ where: { id: row.userId }, data: { emailVerifiedAt: new Date() } }),
  ])
  return { ok: true }
}

export async function resendVerificationEmail(): Promise<ActionState> {
  const { verifySession } = await import('@/lib/session')
  const session = await verifySession()

  const limited = await rateLimit(LIMITS.resendVerify, session.userId)
  if (!limited.ok) return { success: false, error: rateLimitErrorMessage(limited) }

  const user = await db.user.findUnique({ where: { id: session.userId } })
  if (!user) return { success: false, error: 'User not found' }
  if (user.emailVerifiedAt) return { success: true, data: undefined }
  if (!isEmailConfigured()) return { success: false, error: 'Email service is not configured' }

  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_HOURS * 60 * 60 * 1000)
  await db.emailVerificationToken.deleteMany({ where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } } })
  await db.emailVerificationToken.create({ data: { userId: user.id, tokenHash, expiresAt } })

  try {
    await sendVerificationEmail({
      toEmail: user.email, toName: user.name,
      verifyUrl: `${getAppUrl()}/verify-email/${rawToken}`,
      expiresInHours: VERIFY_TOKEN_TTL_HOURS,
    })
  } catch (err) {
    console.error('Resend verification failed:', err instanceof Error ? err.message : err)
    return { success: false, error: 'Failed to send verification email. Please try again.' }
  }
  return { success: true, data: undefined }
}

export async function login(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const result = LoginSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: 'Validation failed', fieldErrors: result.error.flatten().fieldErrors }
  }

  const { email, password } = result.data

  const limited = await rateLimit(LIMITS.login, email)
  if (!limited.ok) return { success: false, error: rateLimitErrorMessage(limited) }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }
  if (!user.passwordHash) {
    return { success: false, error: 'This account uses Google sign-in. Click "Continue with Google" above.' }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return { success: false, error: 'Invalid email or password' }
  }

  await createSession(user.id, user.email)
  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect('/login')
}

const RequestResetSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export async function requestPasswordReset(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = RequestResetSchema.safeParse({ email: formData.get('email') })
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    return { success: false, error: fieldErrors.email?.[0] ?? 'Invalid email', fieldErrors }
  }

  if (!isEmailConfigured()) {
    return {
      success: false,
      error: 'Password reset is temporarily unavailable. Contact support.',
    }
  }

  const email = result.data.email.toLowerCase().trim()

  const limited = await rateLimit(LIMITS.forgotPwd, email)
  if (!limited.ok) return { success: false, error: rateLimitErrorMessage(limited) }

  const user = await db.user.findUnique({ where: { email } })

  if (user) {
    const rawToken = randomBytes(32).toString('hex')
    const tokenHash = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000)

    await db.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    })

    await db.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    })

    try {
      await sendPasswordResetEmail({
        toEmail: user.email,
        toName: user.name,
        resetUrl: `${getAppUrl()}/reset-password/${rawToken}`,
        expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
      })
    } catch (err) {
      console.error('Failed to send password reset email:', err instanceof Error ? err.name : 'unknown')
    }
  }

  return { success: true, data: undefined }
}

const ResetPasswordSchema = z
  .object({
    token: z.string().min(32),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export async function resetPassword(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = ResetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    const first = Object.values(fieldErrors)[0]?.[0]
    return { success: false, error: first ?? 'Validation failed', fieldErrors }
  }

  const { token, password } = result.data
  const tokenHash = hashToken(token)

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return {
      success: false,
      error: 'This reset link is invalid or has expired. Request a new one.',
    }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    db.passwordResetToken.deleteMany({
      where: { userId: record.userId, usedAt: null },
    }),
  ])

  await createSession(record.user.id, record.user.email)
  redirect('/dashboard')
}
