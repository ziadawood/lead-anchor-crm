import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler';
import healthRoutes from './routes/health';
import webhookRoutes from './routes/webhooks';
import authRoutes from './routes/auth';
import onboardingRoutes from './routes/onboarding';
import dealRoutes from './routes/deals';
import contactRoutes from './routes/contacts';
import chatRoutes from './routes/chat';
import billingRoutes from './routes/billing';
import publicRoutes from './routes/public';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  TELNYX_API_KEY: string;
  GEMINI_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Global Middleware
app.use('*', cors());
app.onError(errorHandler);

// Base Routing
const api = app.basePath('/api/v1');

// Register sub-routers
api.route('/health', healthRoutes);
api.route('/auth', authRoutes);
api.route('/onboarding', onboardingRoutes);
api.route('/deals', dealRoutes);
api.route('/contacts', contactRoutes);
api.route('/chat', chatRoutes);
api.route('/billing', billingRoutes);
api.route('/public', publicRoutes);
api.route('/webhooks', webhookRoutes);

// Export for Cloudflare Workers
export default app;
