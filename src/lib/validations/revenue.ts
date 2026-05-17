import { z } from 'zod'

export const RevenueEntrySchema = z.object({
  source: z.enum(['adsense', 'sponsorship', 'affiliate', 'brand_deal', 'merchandise', 'other']),
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
