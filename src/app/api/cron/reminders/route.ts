import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendOverdueReminder } from '@/lib/email'
import { verifyCronAuth } from '@/lib/cron-auth'

const REMINDER_AT_DAYS = [7, 14, 30]

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdueInvoices = await db.invoice.findMany({
    where: {
      status: { in: ['sent', 'overdue'] },
      dueDate: { lt: today },
    },
    include: {
      user: { select: { name: true, email: true } },
      reminderLogs: true,
    },
  })

  let sent = 0
  const errors: string[] = []

  for (const invoice of overdueInvoices) {
    const msOverdue = today.getTime() - invoice.dueDate.getTime()
    const daysOverdue = Math.floor(msOverdue / (1000 * 60 * 60 * 24))

    if (!REMINDER_AT_DAYS.includes(daysOverdue)) continue

    const alreadySent = invoice.reminderLogs.some((l) => l.daysOverdue === daysOverdue)
    if (alreadySent) continue

    try {
      await sendOverdueReminder({
        creatorName: invoice.user.name,
        creatorEmail: invoice.user.email,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        invoiceNumber: invoice.invoiceNumber,
        totalCents: invoice.totalCents,
        dueDate: invoice.dueDate,
        daysOverdue,
        paymentLinkUrl: invoice.paymentLinkUrl,
      })

      await db.reminderLog.create({
        data: { invoiceId: invoice.id, daysOverdue },
      })

      if (invoice.status === 'sent') {
        await db.invoice.update({ where: { id: invoice.id }, data: { status: 'overdue' } })
      }

      sent++
    } catch (err) {
      errors.push(`${invoice.id}: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  return NextResponse.json({ sent, checked: overdueInvoices.length, errors })
}
