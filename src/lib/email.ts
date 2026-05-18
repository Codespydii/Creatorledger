import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Email service is not configured (RESEND_API_KEY missing)')
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'invoices@creatorledger.app'

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

interface PasswordResetParams {
  toEmail: string
  toName: string
  resetUrl: string
  expiresInMinutes: number
}

export async function sendPasswordResetEmail(params: PasswordResetParams) {
  if (!isEmailConfigured()) {
    throw new Error('Email service is not configured')
  }

  await getResend().emails.send({
    from: `Creator Ledger <${FROM}>`,
    to: params.toEmail,
    subject: 'Reset your Creator Ledger password',
    html: buildResetEmailHtml(params),
  })
}

function buildResetEmailHtml(p: PasswordResetParams): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#7c3aed;padding:32px 40px;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:600;">Reset your password</h1>
    </div>
    <div style="padding:40px;">
      <p style="color:#0f172a;font-size:15px;line-height:1.6;margin-top:0;">Hi ${p.toName},</p>
      <p style="color:#0f172a;font-size:15px;line-height:1.6;">We received a request to reset your Creator Ledger password. Click the button below to choose a new one. This link expires in ${p.expiresInMinutes} minutes.</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${p.resetUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">Reset password</a>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.6;">If the button doesn&apos;t work, paste this link into your browser:</p>
      <p style="color:#7c3aed;font-size:13px;line-height:1.6;word-break:break-all;"><a href="${p.resetUrl}" style="color:#7c3aed;">${p.resetUrl}</a></p>
      <p style="color:#64748b;font-size:14px;line-height:1.6;margin-top:24px;">Didn&apos;t request this? You can safely ignore this email — your password won&apos;t change.</p>
    </div>
    <div style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">Sent via <a href="https://creatorledger.app" style="color:#7c3aed;text-decoration:none;">Creator Ledger</a></p>
    </div>
  </div>
</body>
</html>`
}

interface VerifyEmailParams {
  toEmail: string
  toName: string
  verifyUrl: string
  expiresInHours: number
}

export async function sendVerificationEmail(p: VerifyEmailParams) {
  if (!isEmailConfigured()) throw new Error('Email service is not configured')
  await getResend().emails.send({
    from: `Creator Ledger <${FROM}>`,
    to: p.toEmail,
    subject: 'Confirm your email — Creator Ledger',
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#7c3aed;padding:32px 40px;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:600;">Confirm your email</h1>
    </div>
    <div style="padding:40px;">
      <p style="color:#0f172a;font-size:15px;line-height:1.6;margin-top:0;">Hi ${p.toName},</p>
      <p style="color:#0f172a;font-size:15px;line-height:1.6;">Click below to confirm this is your email. This link expires in ${p.expiresInHours} hours.</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${p.verifyUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">Confirm email</a>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.6;">Or paste this link into your browser:</p>
      <p style="color:#7c3aed;font-size:13px;line-height:1.6;word-break:break-all;"><a href="${p.verifyUrl}" style="color:#7c3aed;">${p.verifyUrl}</a></p>
      <p style="color:#64748b;font-size:14px;line-height:1.6;margin-top:24px;">If you didn&apos;t sign up for Creator Ledger, you can safely ignore this email.</p>
    </div>
  </div>
</body></html>`,
  })
}

interface WelcomeEmailParams {
  toEmail: string
  toName: string
  dashboardUrl: string
}

export async function sendWelcomeEmail(p: WelcomeEmailParams) {
  if (!isEmailConfigured()) throw new Error('Email service is not configured')
  const firstName = p.toName.split(' ')[0]
  await getResend().emails.send({
    from: `Mahipal at Creator Ledger <${FROM}>`,
    replyTo: 'mahipalsinghrajput476@gmail.com',
    to: p.toEmail,
    subject: `Welcome to Creator Ledger, ${firstName}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#7c3aed;padding:32px 40px;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Welcome to Creator Ledger 👋</h1>
    </div>
    <div style="padding:40px;">
      <p style="color:#0f172a;font-size:15px;line-height:1.6;margin-top:0;">Hi ${firstName},</p>
      <p style="color:#0f172a;font-size:15px;line-height:1.6;">Thanks for signing up. You&apos;re in the beta — free, no credit card, no surprise charges.</p>
      <p style="color:#0f172a;font-size:15px;line-height:1.6;">Three things to try in your first 60 seconds:</p>
      <ul style="color:#0f172a;font-size:15px;line-height:1.7;padding-left:20px;">
        <li><strong>Connect your YouTube channel</strong> in Settings — AdSense revenue auto-syncs daily.</li>
        <li><strong>Drop a sponsorship contract</strong> in Contracts — AI flags risky clauses in 15 seconds.</li>
        <li><strong>Log your first brand deal</strong> in Brand Deals — pipeline view + reminders.</li>
      </ul>
      <div style="text-align:center;margin:32px 0;">
        <a href="${p.dashboardUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">Open dashboard</a>
      </div>
      <p style="color:#0f172a;font-size:15px;line-height:1.6;margin-top:24px;">If you hit anything weird, just reply to this email. I&apos;m the founder and your message comes straight to me — no support team, no ticket system.</p>
      <p style="color:#0f172a;font-size:15px;line-height:1.6;margin-bottom:0;">— Mahipal</p>
    </div>
    <div style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">You&apos;re receiving this because you signed up at <a href="https://creatorledger.app" style="color:#7c3aed;text-decoration:none;">creatorledger.app</a></p>
    </div>
  </div>
</body></html>`,
  })
}

interface InvoiceSendParams {
  toEmail: string
  toName: string
  fromName: string
  fromEmail: string
  invoiceNumber: string
  totalDisplay: string
  dueDate: string
  publicUrl: string
  message?: string
  pdfBuffer: Buffer
}

export async function sendInvoiceToClient(p: InvoiceSendParams) {
  if (!isEmailConfigured()) throw new Error('Email service is not configured')

  await getResend().emails.send({
    from: `${p.fromName} <${FROM}>`,
    replyTo: p.fromEmail,
    to: p.toEmail,
    subject: `Invoice ${p.invoiceNumber} from ${p.fromName}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#7c3aed;padding:32px 40px;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:600;">Invoice ${p.invoiceNumber}</h1>
    </div>
    <div style="padding:40px;">
      <p style="color:#0f172a;font-size:15px;line-height:1.6;margin-top:0;">Hi ${p.toName},</p>
      <p style="color:#0f172a;font-size:15px;line-height:1.6;">${
        p.message ? p.message.replace(/\n/g, '<br>') : `Please find attached invoice <strong>${p.invoiceNumber}</strong> for <strong>${p.totalDisplay}</strong>, due by ${p.dueDate}.`
      }</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:#64748b;font-size:13px;padding-bottom:6px;">Invoice</td><td style="color:#0f172a;font-size:13px;font-weight:600;text-align:right;padding-bottom:6px;">${p.invoiceNumber}</td></tr>
          <tr><td style="color:#64748b;font-size:13px;padding-bottom:6px;">Amount Due</td><td style="color:#7c3aed;font-size:13px;font-weight:700;text-align:right;padding-bottom:6px;">${p.totalDisplay}</td></tr>
          <tr><td style="color:#64748b;font-size:13px;">Due By</td><td style="color:#0f172a;font-size:13px;text-align:right;">${p.dueDate}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:28px 0;">
        <a href="${p.publicUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">View invoice online</a>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.6;">The PDF is attached to this email for your records.</p>
      <p style="color:#64748b;font-size:14px;line-height:1.6;margin-bottom:0;">Thank you,<br><strong style="color:#0f172a;">${p.fromName}</strong></p>
    </div>
    <div style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">Sent via <a href="https://creatorledgerapp.vercel.app" style="color:#7c3aed;text-decoration:none;">Creator Ledger</a></p>
    </div>
  </div>
</body></html>`,
    attachments: [
      {
        filename: `${p.invoiceNumber}.pdf`,
        content: p.pdfBuffer,
      },
    ],
  })
}

interface OverdueReminderParams {
  creatorName: string
  creatorEmail: string
  clientName: string
  clientEmail: string
  invoiceNumber: string
  totalCents: number
  dueDate: Date
  daysOverdue: number
  paymentLinkUrl?: string | null
}

export async function sendOverdueReminder(params: OverdueReminderParams) {
  const amount = (params.totalCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
  const due = params.dueDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  await getResend().emails.send({
    from: `${params.creatorName} <${FROM}>`,
    replyTo: params.creatorEmail,
    to: params.clientEmail,
    subject: `Payment reminder — Invoice ${params.invoiceNumber} is ${params.daysOverdue} day${params.daysOverdue === 1 ? '' : 's'} overdue`,
    html: buildEmailHtml(params, amount, due),
  })
}

function buildEmailHtml(p: OverdueReminderParams, amount: string, due: string): string {
  const payButton = p.paymentLinkUrl
    ? `<div style="text-align:center;margin:28px 0;">
        <a href="${p.paymentLinkUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">Pay Now</a>
      </div>`
    : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#7c3aed;padding:32px 40px;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:600;">Payment Reminder</h1>
    </div>
    <div style="padding:40px;">
      <p style="color:#0f172a;font-size:15px;line-height:1.6;margin-top:0;">Hi ${p.clientName},</p>
      <p style="color:#0f172a;font-size:15px;line-height:1.6;">This is a friendly reminder that the following invoice is now overdue:</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#64748b;font-size:13px;padding-bottom:8px;">Invoice Number</td>
            <td style="color:#0f172a;font-size:13px;font-weight:600;text-align:right;padding-bottom:8px;">${p.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:13px;padding-bottom:8px;">Original Due Date</td>
            <td style="color:#0f172a;font-size:13px;text-align:right;padding-bottom:8px;">${due}</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:13px;padding-bottom:8px;">Days Overdue</td>
            <td style="color:#ef4444;font-size:13px;font-weight:600;text-align:right;padding-bottom:8px;">${p.daysOverdue} days</td>
          </tr>
          <tr style="border-top:1px solid #e2e8f0;">
            <td style="color:#0f172a;font-size:15px;font-weight:700;padding-top:12px;">Amount Due</td>
            <td style="color:#7c3aed;font-size:15px;font-weight:700;text-align:right;padding-top:12px;">${amount}</td>
          </tr>
        </table>
      </div>
      ${payButton}
      <p style="color:#64748b;font-size:14px;line-height:1.6;">If you have already arranged payment, please disregard this message. For any questions, simply reply to this email.</p>
      <p style="color:#64748b;font-size:14px;line-height:1.6;margin-bottom:0;">Thank you,<br><strong style="color:#0f172a;">${p.creatorName}</strong></p>
    </div>
    <div style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">Sent via <a href="https://creatorledger.app" style="color:#7c3aed;text-decoration:none;">Creator Ledger</a></p>
    </div>
  </div>
</body>
</html>`
}
