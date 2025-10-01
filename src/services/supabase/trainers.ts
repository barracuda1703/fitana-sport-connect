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
    const { data, error } = await supabase
      .from('trainers')
      .select(`
        *,
        public_trainer_profiles!trainers_user_id_fkey (
          id,
          name,
          city,
          avatarurl
        )
      `);
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('trainers')
      .select(`
        *,
        public_trainer_profiles!trainers_user_id_fkey (
          id,
          name,
          city,
          avatarurl
        )
      `)
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
    const { data, error } = await supabase
      .from('trainers')
      .select(`
        *,
        public_trainer_profiles!trainers_user_id_fkey (
          id,
          name,
          city,
          avatarurl
        )
      `)
      .contains('specialties', [specialty]);
    
    if (error) throw error;
    return data;
  }
};
