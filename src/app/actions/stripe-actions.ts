'use server'

import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { makeStripe } from '@/lib/stripe'
import { sealSecret, openSecret } from '@/lib/crypto-seal'

export async function generatePayLink(invoiceId: string): Promise<{ url?: string; error?: string }> {
  const session = await verifySession()

  const [invoice, user] = await Promise.all([
    db.invoice.findUnique({ where: { id: invoiceId } }),
    db.user.findUnique({ where: { id: session.userId }, select: { stripeKey: true } }),
  ])

  if (!invoice || invoice.userId !== session.userId) return { error: 'Invoice not found' }
  if (!user?.stripeKey) return { error: 'Add your Stripe key in Settings → Payments first' }

  if (invoice.paymentLinkUrl) return { url: invoice.paymentLinkUrl }

  try {
    const stripe = makeStripe(openSecret(user.stripeKey))

    const product = await stripe.products.create({
      name: `Invoice ${invoice.invoiceNumber} — ${invoice.clientName}`,
    })

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: invoice.totalCents,
      currency: 'usd',
    })

    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber },
    })

    await db.invoice.update({
      where: { id: invoiceId },
      data: { paymentLinkUrl: link.url },
    })

    return { url: link.url }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Stripe error'
    return { error: msg }
  }
}

export async function saveStripeKey(key: string): Promise<{ error?: string }> {
  const session = await verifySession()

  if (!key.startsWith('sk_')) return { error: 'Invalid key — must start with sk_live_ or sk_test_' }

  try {
    const stripe = makeStripe(key)
    await stripe.balance.retrieve()
  } catch {
    return { error: 'Could not verify key. Check it is correct and active.' }
  }

  await db.user.update({
    where: { id: session.userId },
    data: { stripeKey: sealSecret(key) },
  })

  return {}
}

export async function removeStripeKey(): Promise<void> {
  const session = await verifySession()
  await db.user.update({ where: { id: session.userId }, data: { stripeKey: null } })
}
