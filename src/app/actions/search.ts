'use server'

import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { formatCurrency } from '@/lib/utils'

export interface SearchResult {
  id: string
  type: 'invoice' | 'deal' | 'expense' | 'revenue'
  label: string
  subtitle: string
  meta: string
  href: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const session = await verifySession()
  const q = query.trim()
  if (q.length < 2) return []

  const uid = session.userId
  const contains = (field: string) => ({ contains: field, mode: 'insensitive' as const })

  const [user, invoices, deals, expenses, revenues] = await Promise.all([
    db.user.findUnique({ where: { id: uid }, select: { defaultCurrency: true } }),
    db.invoice.findMany({
      where: {
        userId: uid,
        OR: [
          { clientName: contains(q) },
          { clientEmail: contains(q) },
          { invoiceNumber: contains(q) },
        ],
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    db.deal.findMany({
      where: {
        userId: uid,
        OR: [
          { brandName: contains(q) },
          { contactName: contains(q) },
          { contactEmail: contains(q) },
        ],
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    db.expense.findMany({
      where: {
        userId: uid,
        OR: [
          { description: contains(q) },
          { vendor: contains(q) },
          { category: contains(q) },
        ],
      },
      take: 5,
      orderBy: { date: 'desc' },
    }),
    db.revenueEntry.findMany({
      where: {
        userId: uid,
        OR: [
          { description: contains(q) },
          { platform: contains(q) },
          { source: contains(q) },
        ],
      },
      take: 5,
      orderBy: { date: 'desc' },
    }),
  ])

  const currency = user?.defaultCurrency ?? 'USD'

  const results: SearchResult[] = [
    ...invoices.map((inv) => ({
      id: inv.id,
      type: 'invoice' as const,
      label: inv.clientName,
      subtitle: inv.invoiceNumber,
      meta: formatCurrency(inv.totalCents, currency),
      href: `/invoices/${inv.id}`,
    })),
    ...deals.map((deal) => ({
      id: deal.id,
      type: 'deal' as const,
      label: deal.brandName,
      subtitle: deal.contactName ?? deal.stage,
      meta: formatCurrency(deal.valueCents, currency),
      href: '/deals',
    })),
    ...expenses.map((exp) => ({
      id: exp.id,
      type: 'expense' as const,
      label: exp.description,
      subtitle: exp.vendor ?? exp.category,
      meta: formatCurrency(exp.amountCents, currency),
      href: '/expenses',
    })),
    ...revenues.map((rev) => ({
      id: rev.id,
      type: 'revenue' as const,
      label: rev.description,
      subtitle: rev.platform ?? rev.source,
      meta: formatCurrency(rev.amountCents, currency),
      href: '/revenue',
    })),
  ]

  return results
}
