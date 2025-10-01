import { supabase } from '@/integrations/supabase/client';

export interface TrainerProfile {
  id: string;
  user_id: string;
  display_name?: string;
  rating: number;
  review_count: number;
  price_from?: number;
  specialties: string[];
  is_verified: boolean;
  has_video: boolean;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  languages: string[];
  gallery: string[];
  locations: any[];
  services: any[];
  availability: any[];
  settings: any;
  created_at: string;
  updated_at: string;
}

export const trainersService = {
  async getAll() {
    // Check if user is authenticated to determine which query to use
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Authenticated users get full access to trainer data
      const { data, error } = await supabase
        .from('trainers')
        .select('*');
      
      if (error) throw error;
      return data;
    } else {
      // Unauthenticated users get access to public view only (safe data)
      const { data, error } = await supabase
        .from('trainers_public_view')
        .select('*');
      
      if (error) throw error;
      
      // Map public view data to include missing fields
      return data?.map(trainer => ({
        ...trainer,
        user_id: null as string | null,
        gender: null as string | null
      })) || [];
    }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(trainer: any) {
    const { data, error } = await supabase
      .from('trainers')
      .insert(trainer)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('trainers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateByUserId(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('trainers')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async upsert(userId: string, trainerData: any) {
    const { data, error } = await supabase
      .from('trainers')
      .upsert(
        { user_id: userId, ...trainerData },
        { onConflict: 'user_id' }
      )
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async searchBySpecialty(specialty: string) {
    // Check if user is authenticated to determine which query to use
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Authenticated users get full access
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .contains('specialties', [specialty]);
      
      if (error) throw error;
      return data;
    } else {
      // Unauthenticated users get public view only
      const { data, error } = await supabase
        .from('trainers_public_view')
        .select('*')
        .contains('specialties', [specialty]);
      
      if (error) throw error;
      
      // Map public view data to include missing fields
      return data?.map(trainer => ({
        ...trainer,
        user_id: null as string | null,
        gender: null as string | null
      })) || [];
    }
  }
};
