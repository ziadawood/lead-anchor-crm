import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';
import { PaymentService } from '../services/payment.service';

const billingRoutes = new Hono<{
  Bindings: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; STRIPE_SECRET_KEY?: string };
  Variables: { userId: string; tenantId: string; role: string };
}>();

billingRoutes.use('*', authMiddleware);

billingRoutes.post('/onboard', async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();
  const returnUrl = body.return_url || 'http://localhost:5173/payments';

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  const paymentService = new PaymentService(supabase, c.env.STRIPE_SECRET_KEY);

  try {
    const { url } = await paymentService.onboardTenant(tenantId, returnUrl);
    return c.json({ data: { url } });
  } catch (error: any) {
    console.error('[Billing] Onboarding error:', error.message);
    return c.json({ error: { message: error.message } }, 500);
  }
});

billingRoutes.post('/payment-link', async (c) => {
  const tenantId = c.get('tenantId');
  const { deal_id, amount_cents, item_name, return_url } = await c.req.json();

  if (!deal_id || !amount_cents || !item_name) {
    return c.json({ error: { message: 'Missing required fields' } }, 400);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  const paymentService = new PaymentService(supabase, c.env.STRIPE_SECRET_KEY);

  try {
    const { url } = await paymentService.createPaymentLink(tenantId, deal_id, amount_cents, item_name, return_url || 'http://localhost:5173/payments');
    
    // Also save a draft invoice record
    await supabase.from('invoices').insert([{
      tenant_id: tenantId,
      deal_id: deal_id,
      amount: amount_cents / 100, // DB stores dollars
      status: 'sent',
      line_items: [{ name: item_name, amount_cents }]
    }]);

    return c.json({ data: { url } });
  } catch (error: any) {
    console.error('[Billing] Payment link error:', error.message);
    return c.json({ error: { message: error.message } }, 500);
  }
});

billingRoutes.get('/invoices', async (c) => {
  const tenantId = c.get('tenantId');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      deal:deals(title),
      contact:contacts(first_name, last_name)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: { message: error.message } }, 500);
  return c.json({ data });
});

export default billingRoutes;
