'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { generateInvoiceNumber } from '@/lib/utils'
import type { ActionState } from '@/types'

/**
 * Marker used to tag every row we create here so we can wipe it cleanly later.
 * Stored in `description` (for revenue/expenses) or `notes` (deals/invoices).
 */
const SAMPLE_TAG = '[SAMPLE]'

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

export async function loadSampleData(): Promise<ActionState> {
  const session = await verifySession()
  const userId = session.userId

  // Don't double-load if sample data is already present
  const existing = await db.revenueEntry.count({
    where: { userId, description: { contains: SAMPLE_TAG } },
  })
  if (existing > 0) {
    return { success: false, error: 'Sample data is already loaded. Clear it first to reload.' }
  }

  // ── Revenue: 30 days of mixed-source income ─────────────────────────
  const revenue = [
    { src: 'adsense',      amt: 2840,  desc: 'AdSense — current month',           plat: 'YouTube',   day: 1 },
    { src: 'adsense',      amt: 3120,  desc: 'AdSense — last month',              plat: 'YouTube',   day: 32 },
    { src: 'sponsorship',  amt: 4500,  desc: 'Notion sponsorship — Q3 video',     plat: 'YouTube',   day: 5 },
    { src: 'sponsorship',  amt: 2800,  desc: 'Squarespace integration',           plat: 'YouTube',   day: 14 },
    { src: 'sponsorship',  amt: 3200,  desc: 'Riverside podcast plug',            plat: 'Podcast',   day: 21 },
    { src: 'affiliate',    amt: 420,   desc: 'Amazon Associates — June',          plat: 'YouTube',   day: 8 },
    { src: 'affiliate',    amt: 380,   desc: 'Skillshare referral',               plat: 'YouTube',   day: 18 },
    { src: 'tiktok_fund',  amt: 145,   desc: 'TikTok Creator Fund payout',        plat: 'TikTok',    day: 3 },
    { src: 'memberships',  amt: 680,   desc: 'YouTube Channel Memberships',       plat: 'YouTube',   day: 1 },
    { src: 'merchandise',  amt: 920,   desc: 'Merch store — June total',          plat: 'Shopify',   day: 2 },
    { src: 'tips',         amt: 75,    desc: 'Super Thanks tips',                 plat: 'YouTube',   day: 12 },
  ]
  await db.revenueEntry.createMany({
    data: revenue.map(r => ({
      userId, source: r.src,
      amountCents: r.amt * 100,
      currency: 'USD',
      description: `${r.desc} ${SAMPLE_TAG}`,
      platform: r.plat,
      date: daysAgo(r.day),
    })),
  })

  // ── Expenses: typical creator spend ─────────────────────────────────
  const expenses = [
    { cat: 'equipment',  amt: 1899, desc: 'Sony A7 IV body',                       ven: 'B&H Photo',          day: 7 },
    { cat: 'software',   amt: 23,   desc: 'Adobe Creative Cloud',                   ven: 'Adobe',              day: 1 },
    { cat: 'software',   amt: 39,   desc: 'Notion team plan',                       ven: 'Notion',             day: 1 },
    { cat: 'software',   amt: 15,   desc: 'Figma Pro',                              ven: 'Figma',              day: 2 },
    { cat: 'marketing',  amt: 240,  desc: 'Newsletter promo (Beehiiv)',             ven: 'Beehiiv',            day: 10 },
    { cat: 'contractor', amt: 600,  desc: 'Thumbnail design — 4 videos',            ven: 'Alex Tan',           day: 15 },
    { cat: 'contractor', amt: 850,  desc: 'Video editor — June batch',              ven: 'Priya R.',           day: 22 },
    { cat: 'travel',     amt: 320,  desc: 'Conference travel (VidSummit)',          ven: 'Delta Airlines',     day: 19 },
    { cat: 'office',     amt: 89,   desc: 'Studio LED panel',                       ven: 'Amazon',             day: 11 },
  ]
  await db.expense.createMany({
    data: expenses.map(e => ({
      userId, category: e.cat,
      amountCents: e.amt * 100,
      currency: 'USD',
      description: `${e.desc} ${SAMPLE_TAG}`,
      vendor: e.ven,
      date: daysAgo(e.day),
    })),
  })

  // ── Deals: pipeline across stages ───────────────────────────────────
  const deals = [
    { brand: 'HelloFresh',  contact: 'Mara Liu',     email: 'mara@hellofresh.com',    stage: 'prospect',     value: 5000, deliverables: '1x dedicated YouTube video' },
    { brand: 'NordVPN',     contact: 'James Wright', email: 'james@nordvpn.com',      stage: 'outreach',     value: 3200, deliverables: '60s integration in tech video' },
    { brand: 'Bright Cellars', contact: 'Sara Kim',  email: 'sara@brightcellars.com', stage: 'negotiation',  value: 4200, deliverables: 'Long-form review' },
    { brand: 'Beehiiv',     contact: 'Tyler Denka',  email: 'tyler@beehiiv.com',      stage: 'contracted',   value: 2800, deliverables: '2x newsletter mentions + 1 Shorts' },
    { brand: 'Linear',      contact: 'Mia Park',     email: 'mia@linear.app',         stage: 'in_progress',  value: 3500, deliverables: 'Workflow walkthrough video' },
    { brand: 'Brilliant',   contact: 'Dev Patel',    email: 'dev@brilliant.org',      stage: 'completed',    value: 4800, deliverables: 'Math/coding integration' },
  ]
  await db.deal.createMany({
    data: deals.map(d => ({
      userId, brandName: d.brand, contactName: d.contact, contactEmail: d.email,
      stage: d.stage, valueCents: d.value * 100, currency: 'USD',
      deliverables: d.deliverables,
      notes: SAMPLE_TAG,
    })),
  })

  // ── Invoices: a mix of paid/sent/draft ──────────────────────────────
  const invoices = [
    { client: 'Notion',        email: 'ap@notion.so',         status: 'paid',  total: 4500, daysAgo: 25, daysDue: -5  },
    { client: 'Squarespace',   email: 'finance@squarespace.com', status: 'paid',  total: 2800, daysAgo: 10, daysDue: 5   },
    { client: 'Linear',        email: 'ap@linear.app',        status: 'sent',  total: 3500, daysAgo: 4,  daysDue: 25  },
    { client: 'Brilliant',     email: 'finance@brilliant.org', status: 'sent',  total: 4800, daysAgo: 2,  daysDue: 28  },
    { client: 'Beehiiv',       email: 'ap@beehiiv.com',       status: 'draft', total: 2800, daysAgo: 0,  daysDue: 30  },
  ]
  for (const inv of invoices) {
    await db.invoice.create({
      data: {
        userId,
        invoiceNumber: generateInvoiceNumber(),
        clientName: inv.client,
        clientEmail: inv.email,
        status: inv.status,
        subtotalCents: inv.total * 100,
        taxPercent: 0,
        taxCents: 0,
        totalCents: inv.total * 100,
        issuedDate: daysAgo(inv.daysAgo),
        dueDate: daysAgo(-inv.daysDue),
        paidDate: inv.status === 'paid' ? daysAgo(inv.daysAgo - 5) : null,
        notes: SAMPLE_TAG,
        items: {
          create: [{
            description: `Sponsorship deliverable — ${inv.client}`,
            quantity: 1,
            unitPriceCents: inv.total * 100,
            totalCents: inv.total * 100,
          }],
        },
      },
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/revenue')
  revalidatePath('/expenses')
  revalidatePath('/deals')
  revalidatePath('/invoices')
  revalidatePath('/forecast')
  revalidatePath('/reports')

  return { success: true, data: undefined }
}

export async function clearSampleData(): Promise<ActionState> {
  const session = await verifySession()
  const userId = session.userId

  // Delete in FK-safe order
  // Invoice items first (or rely on cascade), then everything else
  const sampleInvoices = await db.invoice.findMany({
    where: { userId, notes: SAMPLE_TAG },
    select: { id: true },
  })
  if (sampleInvoices.length) {
    await db.invoiceLineItem.deleteMany({
      where: { invoiceId: { in: sampleInvoices.map(i => i.id) } },
    })
    await db.invoice.deleteMany({
      where: { userId, notes: SAMPLE_TAG },
    })
  }

  await db.deal.deleteMany({ where: { userId, notes: SAMPLE_TAG } })
  await db.revenueEntry.deleteMany({ where: { userId, description: { contains: SAMPLE_TAG } } })
  await db.expense.deleteMany({ where: { userId, description: { contains: SAMPLE_TAG } } })

  revalidatePath('/dashboard')
  revalidatePath('/revenue')
  revalidatePath('/expenses')
  revalidatePath('/deals')
  revalidatePath('/invoices')
  revalidatePath('/forecast')
  revalidatePath('/reports')

  return { success: true, data: undefined }
}

export async function hasSampleData(userId: string): Promise<boolean> {
  const count = await db.revenueEntry.count({
    where: { userId, description: { contains: SAMPLE_TAG } },
  })
  return count > 0
}
