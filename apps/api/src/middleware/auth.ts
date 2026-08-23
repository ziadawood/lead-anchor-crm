import { createMiddleware } from 'hono/factory';
import { createClient } from '@supabase/supabase-js';

// Extend Hono's Context Variables to include our auth data
type Env = {
  Bindings: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  };
  Variables: {
    userId: string;
    tenantId: string;
    role: string;
  };
};

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Missing token' } }, 401);
  }

  // Initialize Supabase client with the current request's environment variables
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401);
  }

  // Set the user context for downstream handlers and RLS
  c.set('userId', user.id);
  c.set('tenantId', user.app_metadata?.tenant_id);
  c.set('role', user.app_metadata?.role);

  await next();
});
