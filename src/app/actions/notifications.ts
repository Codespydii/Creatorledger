'use server'

import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { formatCurrency, formatDate } from '@/lib/utils'

export type NotifSeverity = 'error' | 'warning' | 'info' | 'success'

export interface Notification {
  id: string
  severity: NotifSeverity
  title: string
  body: string
  href: string
}

export async function getNotifications(): Promise<Notification[]> {
  const session = await verifySession()
  const uid = session.userId
  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const ago7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [user, overdueInvoices, dueSoonInvoices, recentlyPaid, expiringDeals] = await Promise.all([
    db.user.findUnique({ where: { id: uid }, select: { defaultCurrency: true } }),
    // Sent invoices whose due date has passed (not yet marked overdue)
    db.invoice.findMany({
      where: { userId: uid, status: 'sent', dueDate: { lt: now } },
      orderBy: { dueDate: 'asc' },
    }),
    // Sent invoices due within 7 days
    db.invoice.findMany({
      where: { userId: uid, status: 'sent', dueDate: { gte: now, lte: in7Days } },
      orderBy: { dueDate: 'asc' },
    }),
    // Invoices paid in the last 7 days
    db.invoice.findMany({
      where: { userId: uid, status: 'paid', paidDate: { gte: ago7Days } },
      orderBy: { paidDate: 'desc' },
      take: 5,
    }),
    // Active deals ending within 7 days
    db.deal.findMany({
      where: {
        userId: uid,
        endDate: { gte: now, lte: in7Days },
        stage: { notIn: ['completed', 'cancelled'] },
      },
      orderBy: { endDate: 'asc' },
    }),
  ])

  const currency = user?.defaultCurrency ?? 'USD'
  const notifications: Notification[] = []

  for (const inv of overdueInvoices) {
    notifications.push({
      id: `overdue-${inv.id}`,
      severity: 'error',
      title: `Invoice overdue — ${inv.clientName}`,
      body: `${inv.invoiceNumber} · ${formatCurrency(inv.totalCents, currency)} was due ${formatDate(inv.dueDate.toISOString())}`,
      href: '/invoices',
    })
  }

  for (const inv of dueSoonInvoices) {
    const daysLeft = Math.ceil((inv.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    notifications.push({
      id: `due-soon-${inv.id}`,
      severity: 'warning',
      title: `Invoice due in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — ${inv.clientName}`,
      body: `${inv.invoiceNumber} · ${formatCurrency(inv.totalCents, currency)}`,
      href: '/invoices',
    })
  }

  for (const deal of expiringDeals) {
    const daysLeft = Math.ceil((deal.endDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    notifications.push({
      id: `deal-${deal.id}`,
      severity: 'warning',
      title: `Deal ending in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — ${deal.brandName}`,
      body: `${formatCurrency(deal.valueCents, currency)} · ${deal.stage}`,
      href: '/deals',
    })
  }

  for (const inv of recentlyPaid) {
    notifications.push({
      id: `paid-${inv.id}`,
      severity: 'success',
      title: `Payment received — ${inv.clientName}`,
      body: `${inv.invoiceNumber} · ${formatCurrency(inv.totalCents, currency)}`,
      href: '/invoices',
    })
  }

  return notifications
}
