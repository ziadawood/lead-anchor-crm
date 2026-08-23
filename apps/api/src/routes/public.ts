import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

const publicRoutes = new Hono<{
  Bindings: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string };
}>();

// GET /public/website/:slug
// Fetches the public data needed to render a tenant's website
publicRoutes.get('/website/:slug', async (c) => {
  const slug = c.req.param('slug');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // In a real app, you'd have a public-facing view or very strict RLS to only expose non-sensitive fields
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id, name, slug, theme_config, created_at')
    .eq('slug', slug)
    .single();

  if (error || !tenant) {
    return c.json({ error: { message: 'Website not found' } }, 404);
  }

  // We might also want to fetch their business profile (address, phone, hours) from another table
  // Assuming it's joined or stored in a profiles table. For MVP, we mock some business data based on the tenant.
  const businessData = {
    companyName: tenant.name,
    phone: '(555) 123-4567',
    address: '123 Main St, Cityville, ST',
    hours: 'Mon-Fri 8am-5pm',
    services: ['Emergency Service', 'Maintenance', 'Installations', 'Consulting'],
    heroTitle: `${tenant.name} Services`,
    heroSubtitle: 'Professional, reliable, and always on time.',
    theme: tenant.theme_config || { template: 'clean-light', primaryColor: '#0ea5e9' }
  };

  return c.json({ data: { tenantId: tenant.id, ...businessData } });
});

export default publicRoutes;
