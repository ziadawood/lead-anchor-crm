---
name: ai-chat-assistant
description: LLM-powered AI chat assistant for tenant websites that qualifies leads, answers business questions, and books appointments via streaming conversation.
---

# AI Chat Assistant

## Overview
The AI Chat Assistant replaces the current scripted multi-step chat widget with
an LLM-powered conversational agent. It embeds on every tenant's generated
website and provides 24/7 lead qualification without human intervention.

This competes directly with GoHighLevel's "Conversation AI" feature but is
deeply integrated with LeadAnchor's pipeline and telephony systems.

## Architecture
```
Website Visitor ←→ Chat Widget (React) ←→ SSE Streaming API ←→ LLM Provider
                                                ↓
                                    Lead Qualification Engine
                                         ↓           ↓
                                   Create Contact  Create Deal
                                         ↓
                                   Notify Agent (Push + WebSocket)
```

## LLM Provider
- **Primary**: Google Gemini API (cost-effective, fast)
- **Fallback**: OpenAI GPT-4o-mini
- Configurable per tenant (future: allow tenant to bring own API key)

## System Prompt Template
```
You are a friendly and helpful virtual assistant for {business_name},
a {track_type} company located at {address}.

SERVICES OFFERED:
{services_list}

OPERATING HOURS:
{hours}

YOUR GOALS (in order of priority):
1. Greet the visitor warmly and ask how you can help
2. Answer questions about the business, services, and pricing (use general
   ranges if exact prices aren't available)
3. Collect the following information naturally through conversation:
   - Customer's name
   - Phone number
   - Brief description of the service they need
4. Once you have all three pieces of information, confirm them and let the
   visitor know that a team member will reach out shortly
5. If the visitor asks to book an appointment, collect their preferred
   date/time and confirm

RULES:
- Be concise — keep responses under 3 sentences when possible
- Be professional but friendly
- Never make up specific prices — say "I'd need to have our team provide
  an accurate quote for that"
- If asked about emergencies, emphasize that calling the business directly
  at {phone} is the fastest way to get help
- Do not discuss competitors
- If the conversation goes off-topic, gently redirect

RESPONSE FORMAT:
- Use plain text only (no markdown, HTML, or special formatting)
- Use line breaks for readability
```

## Streaming Chat API

### Endpoint
`POST /api/v1/chat/stream`

### Request
```typescript
interface ChatRequest {
  tenant_slug: string;          // Identifies the tenant
  session_id: string;           // Chat session UUID (created on widget open)
  message: string;              // User's message
}
```

### Response (Server-Sent Events)
```typescript
// Content-Type: text/event-stream
data: {"type": "token", "content": "Hello"}
data: {"type": "token", "content": "! How"}
data: {"type": "token", "content": " can"}
data: {"type": "token", "content": " I help?"}
data: {"type": "done", "session_id": "xxx"}
data: {"type": "lead_qualified", "contact_id": "xxx", "deal_id": "xxx"}
```

### Implementation
```typescript
export async function handleChatStream(c: Context) {
  const { tenant_slug, session_id, message } = await c.req.json();

  // Load tenant profile for system prompt
  const tenant = await tenantService.findBySlug(tenant_slug);
  const systemPrompt = buildSystemPrompt(tenant);

  // Load chat history
  const session = await chatService.getOrCreateSession(session_id, tenant.id);
  const history = session.messages;

  // Append user message
  history.push({ role: 'user', content: message });

  // Stream LLM response
  const stream = await llmService.streamChat(systemPrompt, history);

  return streamSSE(c, async (send) => {
    let fullResponse = '';

    for await (const chunk of stream) {
      fullResponse += chunk;
      await send({ data: JSON.stringify({ type: 'token', content: chunk }) });
    }

    // Save messages to session
    history.push({ role: 'assistant', content: fullResponse });
    await chatService.updateSession(session_id, history);

    // Check for lead qualification
    const qualification = await leadQualifier.analyze(history);
    if (qualification.isQualified) {
      const { contact, deal } = await leadQualifier.createLead(
        tenant.id, qualification
      );
      await send({
        data: JSON.stringify({
          type: 'lead_qualified',
          contact_id: contact.id,
          deal_id: deal.id,
        })
      });
    }

    await send({ data: JSON.stringify({ type: 'done', session_id }) });
  });
}
```

## Lead Qualification Engine

### Extraction
The qualifier analyzes the full conversation history to extract:
```typescript
interface QualificationData {
  isQualified: boolean;
  name: string | null;
  phone: string | null;
  service_needed: string | null;
  urgency: 'emergency' | 'soon' | 'planning' | null;
  preferred_time: string | null;
}
```

### Qualification Trigger
A lead is considered "qualified" when **name + phone + service** are all
collected. At that point:
1. Create/update Contact
2. Create Deal in "New Opportunity"
3. Log chat session as Interaction
4. Notify agent via push notification
5. Send chat confirmation to visitor

## Chat Widget (Frontend)

### Component Structure
```
ChatWidget/
├── ChatWidget.tsx          # Main widget container
├── ChatBubble.tsx          # Individual message bubble
├── ChatInput.tsx           # Text input + send button
├── TypingIndicator.tsx     # Animated dots during LLM streaming
├── ChatToggle.tsx          # Floating action button
└── use-chat.ts             # Hook managing SSE connection + state
```

### State Management
```typescript
interface ChatState {
  isOpen: boolean;
  sessionId: string;
  messages: ChatMessage[];
  isStreaming: boolean;
  isQualified: boolean;
}
```

## Agent Takeover
- Agent can view active chat sessions in the web admin
- Clicking "Take Over" sends a WebSocket event to the chat widget
- Widget switches from AI to human mode
- Human messages bypass the LLM and go directly to the visitor
- Agent sees full AI conversation history for context

## Chat Session Storage
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  contact_id UUID REFERENCES contacts(id),  -- Set after qualification
  messages JSONB DEFAULT '[]',
  status TEXT CHECK (status IN ('active','resolved','escalated')),
  metadata JSONB DEFAULT '{}',  -- { qualified_at, agent_takeover_at }
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
```

## File References
| File | Purpose |
|---|---|
| `apps/api/src/services/ai-chat.service.ts` | LLM interaction + streaming |
| `apps/api/src/services/lead-qualifier.service.ts` | Lead extraction + creation |
| `apps/api/src/routes/chat.ts` | Chat API endpoints |
| `apps/web/src/features/chat-widget/` | Embeddable chat widget |
| `apps/web/src/features/chat-admin/` | Agent view of chat sessions |
| `packages/shared/src/types/chat.ts` | Type definitions |

## Environment Variables
```
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-...           # Fallback
LLM_PROVIDER=gemini             # 'gemini' or 'openai'
LLM_MODEL=gemini-2.0-flash      # Model name
```
