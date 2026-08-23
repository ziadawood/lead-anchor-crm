import { Hono } from 'hono';
import Telnyx from 'telnyx';
import { TelephonyService } from '../services/telephony.service';

const webhooks = new Hono<{
  Bindings: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; TELNYX_API_KEY: string; TELNYX_PUBLIC_KEY?: string };
}>();

webhooks.post('/telnyx', async (c) => {
  const bodyText = await c.req.text();
  const signature = c.req.header('telnyx-signature-ed25519');
  const timestamp = c.req.header('telnyx-timestamp');
  
  // Verify Signature
  if (c.env.TELNYX_PUBLIC_KEY) {
    if (!signature || !timestamp) {
      return c.json({ error: 'Missing Telnyx signature headers' }, 401);
    }
    
    try {
      const telnyx = new (Telnyx as any)(c.env.TELNYX_API_KEY);
      telnyx.webhooks.constructEvent(bodyText, signature, timestamp, c.env.TELNYX_PUBLIC_KEY);
    } catch (err: any) {
      console.error('[Webhook] Invalid Telnyx signature:', err.message);
      return c.json({ error: 'Invalid signature' }, 401);
    }
  } else {
    console.warn('[Webhook] Warning: TELNYX_PUBLIC_KEY not set. Bypassing signature verification for local testing.');
  }

  const payload = JSON.parse(bodyText);
  const eventData = payload.data;
  console.log(`[Webhook] Telnyx Event Received: ${eventData.event_type}`);

  const telephonyService = new TelephonyService(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY, c.env.TELNYX_API_KEY);

  try {
    switch (eventData.event_type) {
      case 'call.initiated':
        await telephonyService.handleCallInitiated(eventData.payload);
        break;
      case 'call.hangup':
        await telephonyService.handleCallHangup(eventData.payload);
        break;
      case 'message.received':
        await telephonyService.handleSmsReceived(eventData.payload);
        break;
      default:
        console.log(`[Webhook] Unhandled event type: ${eventData.event_type}`);
    }
  } catch (err: any) {
    console.error(`[Webhook] Error processing event ${eventData.event_type}:`, err.message);
    // Still return 200 so Telnyx doesn't retry unnecessarily if it's a logic error
  }

  return c.json({ data: { success: true } });
});

webhooks.post('/stripe', async (c) => {
  // In a real implementation, you would verify the Stripe signature using c.env.STRIPE_WEBHOOK_SECRET
  // const sig = c.req.header('stripe-signature');
  const payload = await c.req.json();
  console.log(`[Webhook] Stripe Event Received: ${payload.type}`);

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    switch (payload.type) {
      case 'checkout.session.completed':
        // For the mock MVP, if we receive a session complete, we could mark the invoice paid.
        // In real life, you'd extract metadata.deal_id from the session.
        console.log('[Webhook] Checkout Session Completed', payload.data.object.id);
        break;
      default:
        console.log(`[Webhook] Unhandled Stripe event type: ${payload.type}`);
    }
  } catch (err: any) {
    console.error(`[Webhook] Stripe processing error:`, err.message);
  }

  return c.json({ received: true });
});

export default webhooks;
