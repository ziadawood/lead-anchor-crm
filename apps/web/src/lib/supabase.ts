import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.error('Missing VITE_SUPABASE_URL environment variable. Please add it to your Vercel settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
