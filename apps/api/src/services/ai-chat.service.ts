import { SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { LeadQualifierService } from './lead-qualifier.service';

export class AiChatService {
  private ai: GoogleGenAI | null = null;
  private leadQualifier: LeadQualifierService;

  constructor(
    private supabase: SupabaseClient,
    apiKey: string | undefined
  ) {
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
    this.leadQualifier = new LeadQualifierService(supabase);
  }

  private buildSystemPrompt(tenant: any) {
    return `You are a friendly and helpful virtual assistant for ${tenant.name || 'our business'}.

YOUR GOALS (in order of priority):
1. Greet the visitor warmly and ask how you can help.
2. Answer questions about the business, services, and pricing.
3. Collect the following information naturally through conversation:
   - Customer's name
   - Phone number
   - Brief description of the service they need
4. Once you have a phone number, let the visitor know that a team member will reach out shortly.

RULES:
- Be concise — keep responses under 3 sentences when possible.
- Be professional but friendly.
- Do not discuss competitors.
- If the conversation goes off-topic, gently redirect.

RESPONSE FORMAT:
- Use plain text only.`;
  }

  async getOrCreateSession(sessionId: string, tenantId: string) {
    // For MVP, we will store the session in memory or a mock object if the chat_sessions table isn't ready.
    // Assuming the table exists based on the SQL provided earlier:
    
    // Check if table exists/works, fallback to returning an empty session if DB throws
    try {
      const { data } = await this.supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
        
      if (data) return data;

      const { data: newSession, error } = await this.supabase
        .from('chat_sessions')
        .insert([{ id: sessionId, tenant_id: tenantId, messages: [] }])
        .select()
        .single();
        
      if (error) throw error;
      return newSession;
    } catch (e) {
      console.warn('[AiChatService] chat_sessions table might not exist yet, mocking session.');
      return { id: sessionId, tenant_id: tenantId, messages: [] };
    }
  }

  async updateSession(sessionId: string, messages: any[]) {
    try {
      await this.supabase
        .from('chat_sessions')
        .update({ messages })
        .eq('id', sessionId);
    } catch (e) {
      // Ignore if table doesn't exist yet
    }
  }

  async streamChat(tenantId: string, sessionId: string, userMessage: string, sendSSEEvent: (data: string) => Promise<void>) {
    // 1. Load tenant for prompt
    const { data: tenant } = await this.supabase.from('tenants').select('name').eq('id', tenantId).single();
    const systemPrompt = this.buildSystemPrompt(tenant || {});

    // 2. Load session
    const session = await this.getOrCreateSession(sessionId, tenantId);
    const history = session.messages || [];
    history.push({ role: 'user', content: userMessage });

    let fullResponse = '';

    // 3. Stream from LLM
    if (!this.ai) {
      // Mock streaming response if no API key
      const mockWords = ["Hi ", "there! ", "I'm ", "the ", "AI ", "assistant. ", "How ", "can ", "I ", "help ", "you ", "today?"];
      for (const word of mockWords) {
        fullResponse += word;
        await sendSSEEvent(JSON.stringify({ type: 'token', content: word }));
        await new Promise(r => setTimeout(r, 50)); // Artificial delay
      }
    } else {
      // Format history for Gemini SDK
      // The new Gemini SDK uses a different history format
      const contents = history.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }]
      }));

      try {
        const stream = await this.ai.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
          }
        });

        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            fullResponse += text;
            await sendSSEEvent(JSON.stringify({ type: 'token', content: text }));
          }
        }
      } catch (e: any) {
        console.error('[AiChatService] LLM Error:', e.message);
        const errText = "I'm sorry, I'm having trouble connecting right now.";
        fullResponse += errText;
        await sendSSEEvent(JSON.stringify({ type: 'token', content: errText }));
      }
    }

    // 4. Save to history
    history.push({ role: 'assistant', content: fullResponse });
    await this.updateSession(sessionId, history);

    // 5. Qualification
    const qualification = await this.leadQualifier.analyze(history);
    if (qualification.isQualified) {
      try {
        const { contactId, dealId } = await this.leadQualifier.createLead(tenantId, qualification);
        await sendSSEEvent(JSON.stringify({
          type: 'lead_qualified',
          contact_id: contactId,
          deal_id: dealId
        }));
      } catch (e: any) {
        console.error('[AiChatService] Failed to create lead from qualification:', e.message);
      }
    }

    await sendSSEEvent(JSON.stringify({ type: 'done', session_id: sessionId }));
  }
}
