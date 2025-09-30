import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
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
