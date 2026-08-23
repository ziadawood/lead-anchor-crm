import { z } from 'zod';

const lineItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().int().min(1),
  unit_price: z.number().min(0),
  total: z.number().min(0),
});

export const invoiceCreateSchema = z.object({
  deal_id: z.string().uuid().optional(),
  contact_id: z.string().uuid(),
  amount: z.number().positive(),
  due_date: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1),
});

export const invoiceUpdateSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  due_date: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1).optional(),
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;
