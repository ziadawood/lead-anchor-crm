import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const authRoutes = new Hono<{
  Bindings: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string; SUPABASE_SERVICE_ROLE_KEY?: string };
  Variables: { userId: string; tenantId: string; role: string };
}>();

// Note: Standard signup (creating auth.users) is handled directly client-side.
// This endpoint handles the internal creation of the tenant and setting JWT claims.
authRoutes.post('/signup-finalize', async (c) => {
  const { userId, email, companyName } = await c.req.json();

  if (!c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ error: { code: 'SERVER_ERROR', message: 'Service role key not configured' } }, 500);
  }

  const supabaseAdmin = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. Create Tenant
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert([{ name: companyName }])
    .select()
    .single();

  if (tenantError) return c.json({ error: { code: 'DB_ERROR', message: tenantError.message } }, 500);

  // 2. Create Public User mapping
  const { error: userError } = await supabaseAdmin
    .from('users')
    .insert([{ id: userId, email, tenant_id: tenant.id, role: 'admin' }]);

  if (userError) return c.json({ error: { code: 'DB_ERROR', message: userError.message } }, 500);

  // 3. Set Custom JWT Claims
  const { error: claimsError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { tenant_id: tenant.id, role: 'admin' },
  });

  if (claimsError) return c.json({ error: { code: 'AUTH_ERROR', message: claimsError.message } }, 500);

  return c.json({ data: { success: true, tenantId: tenant.id } });
});


// Protected route example: Inviting a team member requires Admin role
authRoutes.post('/invite', authMiddleware, requireRole('admin'), async (c) => {
  const { email, role } = await c.req.json();
  const tenantId = c.get('tenantId');

  const supabaseAdmin = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  // Send invite via Supabase Auth
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { role, tenant_id: tenantId }
  });

  if (error) return c.json({ error: { code: 'INVITE_FAILED', message: error.message } }, 400);

  return c.json({ data: { message: `Invite sent to ${email}` } });
});

export default authRoutes;
