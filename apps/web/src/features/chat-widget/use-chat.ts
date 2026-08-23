import { useState, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const useChat = (tenantId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Hi! How can I help you today?' }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const sessionId = useRef(`session_${Math.random().toString(36).substring(7)}`);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch('http://localhost:8787/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          session_id: sessionId.current,
          message: text,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let assistantMessageContent = '';
      const assistantMessageId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const events = chunk.split('\n\n').filter(Boolean);

          for (const event of events) {
            if (event.startsWith('data: ')) {
              try {
                const data = JSON.parse(event.slice(6));
                
                if (data.type === 'token') {
                  assistantMessageContent += data.content;
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: assistantMessageContent } 
                      : msg
                  ));
                } else if (data.type === 'lead_qualified') {
                  // You could trigger a UI state change here, e.g., showing a checkmark
                  console.log('Lead Qualified!', data);
                }
              } catch (e) {
                console.error('Error parsing SSE', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    messages,
    isStreaming,
    sendMessage,
  };
};
