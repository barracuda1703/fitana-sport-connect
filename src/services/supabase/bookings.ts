import { supabase } from '@/integrations/supabase/client';

export interface RescheduleRequest {
  id: string;
  requestedAt: string;
  requestedBy: 'client' | 'trainer';
  newTime: string;
  status: 'pending' | 'accepted' | 'declined';
  awaitingDecisionBy: 'client' | 'trainer';
}

export interface Booking {
  id: string;
  client_id: string;
  trainer_id: string;
  service_id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled';
  notes?: string;
  reschedule_requests: any[];
  created_at: string;
  updated_at: string;
}

export const bookingsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!bookings_client_id_fkey (
          id,
          name,
          surname,
          email,
          avatarurl
        ),
        trainer:profiles!bookings_trainer_id_fkey (
          id,
          name,
          surname,
          email,
          avatarurl
        )
      `)
      .order('scheduled_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!bookings_client_id_fkey (
          id,
          name,
          surname,
          email,
          avatarurl
        ),
        trainer:profiles!bookings_trainer_id_fkey (
          id,
          name,
          surname,
          email,
          avatarurl
        )
      `)
      .or(`client_id.eq.${userId},trainer_id.eq.${userId}`)
      .order('scheduled_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!bookings_client_id_fkey (
          id,
          name,
          surname,
          email,
          avatarurl
        ),
        trainer:profiles!bookings_trainer_id_fkey (
          id,
          name,
          surname,
          email,
          avatarurl
        )
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(booking: any) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: Booking['status']) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getByTrainerAndDate(trainerId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('trainer_id', trainerId)
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())
      .in('status', ['pending', 'confirmed']);
    
    if (error) throw error;
    return data;
  }
};
