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
    
    // Listen for new ghost leads via Supabase Realtime on the interactions table
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
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-2xl p-4 w-80 relative flex gap-3 cursor-pointer group hover:bg-slate-50 transition-colors"
           onClick={() => {
             setIsVisible(false);
             if (ghostLead.contact_id) navigate(`/contacts/${ghostLead.contact_id}`);
           }}>
        
        <button 
          onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mt-1">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-slate-900 text-sm">Ghost Lead Captured!</h4>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
            {ghostLead.metadata?.summary || 'An abandoned call was automatically captured.'}
          </p>
          <div className="mt-2 flex items-center text-xs font-semibold text-red-600 group-hover:text-red-700 transition-colors">
            View Profile <ChevronRight className="w-3 h-3 ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
