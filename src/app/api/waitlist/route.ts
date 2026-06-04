import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, rateLimitErrorMessage } from '@/lib/rate-limit'

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatorledgerapp.vercel.app'
const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL

let _resend: Resend | null = null
function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY missing')
  }
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

interface ResendErrorShape {
  name?: string
  message?: string
  statusCode?: number
}

function isDuplicateContactError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const err = e as ResendErrorShape
  const msg = (err.message ?? '').toLowerCase()
  return err.statusCode === 409 || msg.includes('already exists') || msg.includes('duplicate')
}

export async function POST(req: Request) {
  let email: string
  try {
    const body = (await req.json()) as { email?: unknown }
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  } catch {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
  }

  if (!email || !EMAIL_RX.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
  }

  const rl = await rateLimit({ name: 'waitlist', limit: 5, windowSec: 60 * 60 }, email)
  if (!rl.ok) {
    return NextResponse.json({ error: rateLimitErrorMessage(rl) }, { status: 429 })
  }

  const resend = getResend()
  const audienceId = process.env.RESEND_AUDIENCE_ID
  let duplicate = false

  if (audienceId) {
    try {
      const result = await resend.contacts.create({
        email,
        audienceId,
        unsubscribed: false,
      })
      if (result.error && isDuplicateContactError(result.error)) {
        duplicate = true
      } else if (result.error) {
        console.error('[waitlist] contacts.create failed:', result.error)
      }
    } catch (e) {
      if (isDuplicateContactError(e)) {
        duplicate = true
      } else {
        console.error('[waitlist] contacts.create threw:', e)
      }
    }
  } else {
    console.warn('[waitlist] RESEND_AUDIENCE_ID not set — skipping audience add, still sending emails.')
  }

  try {
    await Promise.all([
      resend.emails.send({
        from: `Mahipal from Caelo <${FROM}>`,
        to: email,
        subject: 'Your Caelo beta access is ready',
        html: buildWelcomeHtml(),
      }),
      FOUNDER_EMAIL
        ? resend.emails.send({
            from: `Caelo Signups <${FROM}>`,
            to: FOUNDER_EMAIL,
            subject: `New beta signup: ${email}`,
            html: `<p>New founding member: <strong>${email}</strong></p><p>Check Resend Audiences for the full list.</p>`,
          })
        : Promise.resolve(),
    ])
  } catch (e) {
    console.error('[waitlist] email send failed:', e)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, duplicate })
}

function buildWelcomeHtml(): string {
  const signupUrl = `${APP_URL}/signup`
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="background:#7c3aed;padding:28px 40px;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">You&apos;re in the founding beta</h1>
    </div>
    <div style="padding:36px 40px;">
      <p style="color:#0f172a;font-size:15px;line-height:1.6;margin-top:0;">Hey &mdash; thanks for joining the founding beta.</p>
      <p style="color:#0f172a;font-size:15px;line-height:1.6;">
        You&apos;ve locked in the founding member price:
        <strong>$9/mo forever</strong> &mdash; 50% off, even after we raise prices.
      </p>
      <p style="color:#0f172a;font-size:15px;line-height:1.6;">Here&apos;s your access link:</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${signupUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">Open Caelo &rarr;</a>
      </div>
      <p style="color:#64748b;font-size:14px;line-height:1.6;">Takes 2 minutes to connect YouTube and see your income dashboard.</p>
      <p style="color:#64748b;font-size:14px;line-height:1.6;">Reply to this email if anything feels broken &mdash; I&apos;m the solo founder and I read every reply.</p>
      <p style="color:#0f172a;font-size:15px;line-height:1.6;margin-bottom:0;">&mdash; Mahipal<br>Caelo</p>
    </div>
  </div>
</body></html>`
}
