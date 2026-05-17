import { z } from 'zod'

export const InvoiceLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Price must be a non-negative number'
  ),
})

export const InvoiceSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(100),
  clientEmail: z.string().email('Please enter a valid email'),
  dueDate: z.string().min(1, 'Due date is required'),
  taxPercent: z.string().default('0'),
  notes: z.string().max(500).optional(),
  items: z.array(InvoiceLineItemSchema).min(1, 'At least one line item is required'),
})

export type InvoiceInput = z.infer<typeof InvoiceSchema>
