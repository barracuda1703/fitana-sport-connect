import { createClient } from '@supabase/supabase-js';

// Lovable Cloud automatically provides these environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Available env vars:', import.meta.env);
  throw new Error(
    'Supabase environment variables are not configured. ' +
    'Please check that Lovable Cloud is properly enabled in your project settings.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Profile = {
  id: string;
  role: 'client' | 'trainer';
  email: string;
  name: string;
  surname?: string;
  city?: string;
  language?: string;
  avatarUrl?: string;
  password?: string;
  created_at: string;
  updated_at: string;
};
