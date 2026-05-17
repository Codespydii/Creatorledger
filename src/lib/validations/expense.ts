import { z } from 'zod'

export const ExpenseSchema = z.object({
  category: z.enum(['equipment', 'software', 'travel', 'marketing', 'contractor', 'office', 'taxes', 'other']),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Amount must be a positive number'
  ),
  currency: z.string().default('USD'),
  description: z.string().min(1, 'Description is required').max(200),
  vendor: z.string().max(100).optional(),
  date: z.string().min(1, 'Date is required'),
})

export type ExpenseInput = z.infer<typeof ExpenseSchema>
