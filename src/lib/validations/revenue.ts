import { z } from 'zod'

// Note: `brand_deal` is kept as a legacy value to preserve existing rows; it's
// no longer surfaced in the UI dropdown. New entries should use `sponsorship`.
export const RevenueEntrySchema = z.object({
  source: z.enum([
    'adsense',
    'sponsorship',
    'brand_deal',     // legacy — keep for read-back compat
    'affiliate',
    'tiktok_fund',
    'patreon',
    'substack',
    'memberships',
    'podcast',
    'merchandise',
    'tips',
    'other',
  ]),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Amount must be a positive number'
  ),
  currency: z.string().default('USD'),
  description: z.string().min(1, 'Description is required').max(200),
  platform: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  dealId: z.string().optional(),
})

export type RevenueEntryInput = z.infer<typeof RevenueEntrySchema>
