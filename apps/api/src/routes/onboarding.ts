import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';
import { NumberProvisioningService } from '../services/number-provisioning.service';

const onboardingRoutes = new Hono<{
  Bindings: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string; SUPABASE_SERVICE_ROLE_KEY?: string; TELNYX_API_KEY: string; };
  Variables: { userId: string; tenantId: string; role: string };
}>();

// All onboarding routes require an active session
onboardingRoutes.use('*', authMiddleware);

// 1. Update Profile & Location
onboardingRoutes.put('/profile', async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();
  
  if (!c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ error: { code: 'SERVER_ERROR', message: 'Service role key missing' } }, 500);
  }

  const supabaseAdmin = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // Update tenant profile
  const { error } = await supabaseAdmin
    .from('tenants')
    .update({
      name: body.companyName,
      // We would also map address, city, state, zip, and hours to columns here
      // For MVP, we assume the tenants table has these or a JSONB settings column
    })
    .eq('id', tenantId);

  if (error) return c.json({ error: { code: 'DB_ERROR', message: error.message } }, 500);

  return c.json({ data: { success: true } });
});

// 2. Search Phone Numbers
onboardingRoutes.get('/numbers/search', async (c) => {
  const areaCode = c.req.query('areaCode');
  
  if (!areaCode || areaCode.length < 3) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Valid area code required' } }, 400);
  }

  const provisioningService = new NumberProvisioningService(c.env.TELNYX_API_KEY || 'mock-key');
  const numbers = await provisioningService.searchNumbers(areaCode);

  return c.json({ data: { numbers } });
});

// 3. Provision Phone Number
onboardingRoutes.post('/numbers/provision', async (c) => {
  const tenantId = c.get('tenantId');
  const { phoneNumber } = await c.req.json();
  
  if (!phoneNumber) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Phone number required' } }, 400);
  }

  const provisioningService = new NumberProvisioningService(c.env.TELNYX_API_KEY || 'mock-key');
  const result = await provisioningService.provisionNumber(phoneNumber, tenantId);

  if (!result.success) {
    return c.json({ error: { code: 'PROVISION_FAILED', message: 'Failed to order number from carrier' } }, 500);
  }

  // Save the provisioned number to the database
  const supabaseAdmin = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabaseAdmin
    .from('phone_numbers')
    .insert([{
      tenant_id: tenantId,
      number: result.phoneNumber,
      provider_id: result.telnyxId,
      is_primary: true
    }]);

  if (error) return c.json({ error: { code: 'DB_ERROR', message: error.message } }, 500);

  return c.json({ data: { success: true, number: result.phoneNumber } });
});

export default onboardingRoutes;
