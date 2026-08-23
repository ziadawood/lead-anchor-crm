import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { streamSSE } from 'hono/streaming';
import { AiChatService } from '../services/ai-chat.service';

const chatRoutes = new Hono<{
  Bindings: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; GEMINI_API_KEY?: string };
}>();

chatRoutes.post('/stream', async (c) => {
  const { tenant_id, session_id, message } = await c.req.json();
  
  if (!tenant_id || !session_id || !message) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  const aiChatService = new AiChatService(supabase, c.env.GEMINI_API_KEY);

  return streamSSE(c, async (stream) => {
    // We pass a callback that the service uses to push SSE events
    await aiChatService.streamChat(tenant_id, session_id, message, async (dataStr) => {
      await stream.writeSSE({ data: dataStr });
    });
  });
});

export default chatRoutes;
