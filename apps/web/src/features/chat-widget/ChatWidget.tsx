import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Anchor } from 'lucide-react';
import { useChat } from './use-chat';
import { useAuth } from '../auth/use-auth';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { session } = useAuth();
  
  const tenantId = session?.user?.app_metadata?.tenant_id || 'mock-tenant-id';
  
  const { messages, isStreaming, sendMessage } = useChat(tenantId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] mb-4 flex flex-col overflow-hidden"
          style={{
            background: 'rgba(15,23,42,0.95)',
            border: '1px solid rgba(148,163,184,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <div className="flex items-center gap-2">
              <Anchor className="w-4 h-4 text-white/80" />
              <div>
                <h3 className="font-bold text-sm text-white">AI Assistant</h3>
                <p className="text-white/60 text-[10px]">We typically reply instantly.</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-2 rounded-full transition-colors text-white/80">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'rgba(15,23,42,0.5)' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="chat-bubble-ai">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3" style={{ borderTop: '1px solid rgba(148,163,184,0.06)', background: 'rgba(15,23,42,0.8)' }}>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full px-4 py-2 text-sm text-slate-200 outline-none"
                style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)' }}
                disabled={isStreaming}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="p-2.5 rounded-full transition-all disabled:opacity-40 text-white"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-600">Powered by LeadAnchor AI</span>
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95 text-white"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 8px 25px rgba(59,130,246,0.35)' }}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
