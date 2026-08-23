import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';
import { dealCreateSchema, dealUpdateSchema } from '@leadanchor/shared';

const dealRoutes = new Hono<{
  Bindings: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY?: string };
  Variables: { userId: string; tenantId: string; role: string };
}>();

dealRoutes.use('*', authMiddleware);

// Fetch all deals with their contact and stage data
dealRoutes.get('/', async (c) => {
  const tenantId = c.get('tenantId');
  const supabaseAdmin = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data, error } = await supabaseAdmin
    .from('deals')
    .select(`
      *,
      contact:contacts(first_name, last_name, phone, email),
      stage:pipeline_stages(id, name, position)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: { code: 'DB_ERROR', message: error.message } }, 500);

  return c.json({ data });
});

// Update a deal (e.g., stage change)
dealRoutes.patch('/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const dealId = c.req.param('id');
  const body = await c.req.json();

  const parseResult = dealUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: parseResult.error.errors[0].message } }, 400);
  }

  const supabaseAdmin = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data, error } = await supabaseAdmin
    .from('deals')
    .update(parseResult.data)
    .eq('id', dealId)
    .eq('tenant_id', tenantId) // Ensure tenant isolation
    .select()
    .single();

  if (error) return c.json({ error: { code: 'DB_ERROR', message: error.message } }, 500);

  return c.json({ data });
});

export default dealRoutes;
