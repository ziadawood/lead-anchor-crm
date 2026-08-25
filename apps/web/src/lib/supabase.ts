import { createClient } from '@supabase/supabase-js';

// Default to the project Supabase credentials if environment variables are not set in Vercel
export const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://affvbyvbecsvghewjnnk.supabase.co';

export const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZnZieXZiZWNzdmdoZXdqbm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MjA4ODQsImV4cCI6MjEwMzA5Njg4NH0.LHSZ6aykM1dbmLDspyf9PeAcW2Pmn8zhwtAZ08HlDHE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
