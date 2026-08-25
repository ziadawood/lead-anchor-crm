import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertCircle, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/use-auth';

export const GhostLeadToast = () => {
  const [ghostLead, setGhostLead] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.user?.app_metadata?.tenant_id) return;
    
    const channel = supabase
      .channel('ghost-leads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interactions',
          filter: `tenant_id=eq.${session.user.app_metadata.tenant_id}`,
        },
        (payload: any) => {
          if (payload.new.type === 'ghost_lead') {
            setGhostLead(payload.new);
            setIsVisible(true);
            setTimeout(() => setIsVisible(false), 10000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!isVisible || !ghostLead) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in-up">
      <div className="ghost-toast w-80"
           onClick={() => {
             setIsVisible(false);
             if (ghostLead.contact_id) navigate(`/contacts/${ghostLead.contact_id}`);
           }}>
        
        <button 
          onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
          className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mt-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-white text-sm">Ghost Lead Captured!</h4>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
            {ghostLead.metadata?.summary || 'An abandoned call was automatically captured.'}
          </p>
          <div className="mt-2 flex items-center text-xs font-semibold text-red-400 hover:text-red-300 transition-colors">
            View Profile <ChevronRight className="w-3 h-3 ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
