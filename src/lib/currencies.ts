export const SUPPORTED_CURRENCIES = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'INR'] as const
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]

export const CURRENCY_META: Record<SupportedCurrency, { symbol: string; label: string }> = {
  USD: { symbol: '$',  label: 'US Dollar (USD)' },
  GBP: { symbol: '£',  label: 'British Pound (GBP)' },
  EUR: { symbol: '€',  label: 'Euro (EUR)' },
  CAD: { symbol: 'C$', label: 'Canadian Dollar (CAD)' },
  AUD: { symbol: 'A$', label: 'Australian Dollar (AUD)' },
  INR: { symbol: '₹',  label: 'Indian Rupee (INR)' },
}

export function currencySymbol(c: string | null | undefined): string {
  if (!c) return '$'
  return CURRENCY_META[c as SupportedCurrency]?.symbol ?? '$'
}

export function isSupportedCurrency(c: unknown): c is SupportedCurrency {
  return typeof c === 'string' && (SUPPORTED_CURRENCIES as readonly string[]).includes(c)
}

export const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map(c => ({
  value: c,
  label: CURRENCY_META[c].label,
}))
