import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  tenantId: string | null;
  role: string | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  session: null,
  user: null,
  tenantId: null,
  role: null,
  isLoading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      set({ 
        session, 
        user: session?.user ?? null,
        tenantId: session?.user?.app_metadata?.tenant_id ?? null,
        role: session?.user?.app_metadata?.role ?? null,
        isLoading: false 
      });

      supabase.auth.onAuthStateChange((_event, newSession) => {
        set({ 
          session: newSession, 
          user: newSession?.user ?? null,
          tenantId: newSession?.user?.app_metadata?.tenant_id ?? null,
          role: newSession?.user?.app_metadata?.role ?? null,
          isLoading: false 
        });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, tenantId: null, role: null });
  }
}));
