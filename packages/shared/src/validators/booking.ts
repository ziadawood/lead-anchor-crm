import { z } from 'zod';

export const bookingCreateSchema = z.object({
  contact_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().int().min(15).max(480).default(60),
  service_type: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});

export const bookingUpdateSchema = z.object({
  scheduled_at: z.string().datetime().optional(),
  duration_minutes: z.number().int().min(15).max(480).optional(),
  service_type: z.string().max(100).optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().max(2000).optional(),
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;
