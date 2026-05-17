import { z } from 'zod'

export const DealSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required').max(100),
  contactName: z.string().max(100).optional(),
  contactEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  stage: z.enum(['prospect', 'outreach', 'negotiation', 'contracted', 'in_progress', 'completed', 'lost']),
  value: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Value must be a non-negative number'
  ),
  currency: z.string().default('USD'),
  description: z.string().max(500).optional(),
  deliverables: z.string().max(1000).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

export type DealInput = z.infer<typeof DealSchema>
