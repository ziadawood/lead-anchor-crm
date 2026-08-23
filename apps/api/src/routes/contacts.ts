import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';
import { contactCreateSchema } from '@leadanchor/shared';

const contactRoutes = new Hono<{
  Bindings: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY?: string };
  Variables: { userId: string; tenantId: string; role: string };
}>();

contactRoutes.use('*', authMiddleware);

// GET /contacts - Fetch all contacts
contactRoutes.get('/', async (c) => {
  const tenantId = c.get('tenantId');
  const supabaseAdmin = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data, error } = await supabaseAdmin
    .from('contacts')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: { code: 'DB_ERROR', message: error.message } }, 500);
  return c.json({ data });
});

// GET /contacts/:id - Fetch single contact with interactions
contactRoutes.get('/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const contactId = c.req.param('id');
  const supabaseAdmin = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: contact, error: contactError } = await supabaseAdmin
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .eq('tenant_id', tenantId)
    .single();

  if (contactError) return c.json({ error: { code: 'NOT_FOUND', message: 'Contact not found' } }, 404);

  const { data: interactions, error: interactionsError } = await supabaseAdmin
    .from('interactions')
    .select('*')
    .eq('contact_id', contactId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (interactionsError) return c.json({ error: { code: 'DB_ERROR', message: interactionsError.message } }, 500);

  return c.json({ data: { ...contact, interactions } });
});

// POST /contacts - Create a new contact with duplicate detection
contactRoutes.post('/', async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();

  const parseResult = contactCreateSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: parseResult.error.errors[0].message } }, 400);
  }

  const contactData = parseResult.data;
  const supabaseAdmin = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Duplicate Detection Logic
  if (contactData.phone) {
    const { data: existing } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('phone', contactData.phone)
      .single();

    if (existing) {
      return c.json({
        error: { code: 'DUPLICATE_CONTACT', message: 'A contact with this phone number already exists' },
        data: { existingContactId: existing.id }
      }, 409); // 409 Conflict
    }
  }

  const { data, error } = await supabaseAdmin
    .from('contacts')
    .insert([{ ...contactData, tenant_id: tenantId }])
    .select()
    .single();

  if (error) return c.json({ error: { code: 'DB_ERROR', message: error.message } }, 500);
  return c.json({ data }, 201);
});

export default contactRoutes;
