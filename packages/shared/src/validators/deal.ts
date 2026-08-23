import { z } from 'zod';

export const dealCreateSchema = z.object({
  contact_id: z.string().uuid().optional(),
  stage_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200),
  value: z.number().positive().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  source: z.string().max(50).optional(),
  assigned_to: z.string().uuid().optional(),
  notes: z.string().max(5000).optional(),
});

export const dealUpdateSchema = z.object({
  stage_id: z.string().uuid().optional(),
  title: z.string().min(1).max(200).optional(),
  value: z.number().positive().nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  notes: z.string().max(5000).optional(),
});

export type DealCreateInput = z.infer<typeof dealCreateSchema>;
export type DealUpdateInput = z.infer<typeof dealUpdateSchema>;
