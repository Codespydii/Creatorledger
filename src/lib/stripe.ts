import Stripe from 'stripe'

export function makeStripe(secretKey: string) {
  return new Stripe(secretKey)
}
