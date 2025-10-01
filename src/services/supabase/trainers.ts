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
    } else {
      // Unauthenticated users get access to public view only (safe data)
      const { data, error } = await supabase
        .from('trainers_public_view')
        .select('*');
      
      if (error) throw error;
      
      // Normalize the data to match the expected trainer structure
      // Add missing fields that aren't in the public view
      return data?.map(trainer => ({
        ...trainer,
        user_id: null, // Don't expose user_id to unauthenticated users
        gender: null, // Don't expose gender to unauthenticated users
        availability: null, // Don't expose availability schedules
        settings: null, // Don't expose settings
        off_mode: null, // Don't expose internal state
        updated_at: trainer.created_at, // Use created_at as fallback
        public_trainer_profiles: {
          id: trainer.id,
          name: trainer.name,
          city: trainer.city,
          avatarurl: trainer.avatarurl
        }
      })) || [];
    }
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
    // Check if user is authenticated to determine which query to use
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Authenticated users get full access
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
    } else {
      // Unauthenticated users get public view only
      const { data, error } = await supabase
        .from('trainers_public_view')
        .select('*')
        .contains('specialties', [specialty]);
      
      if (error) throw error;
      
      // Normalize the data to match the expected trainer structure
      return data?.map(trainer => ({
        ...trainer,
        user_id: null,
        gender: null,
        availability: null,
        settings: null,
        off_mode: null,
        updated_at: trainer.created_at,
        public_trainer_profiles: {
          id: trainer.id,
          name: trainer.name,
          city: trainer.city,
          avatarurl: trainer.avatarurl
        }
      })) || [];
    }
  }
};
