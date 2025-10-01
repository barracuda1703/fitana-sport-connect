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
  client?: {
    id: string;
    name: string;
    surname: string;
    email: string;
    avatarurl?: string;
  } | null;
  trainer?: {
    id: string;
    name: string;
    surname: string;
    email: string;
    avatarurl?: string;
  } | null;
}

export const bookingsService = {
  async getAll() {
    // Fetch bookings without JOIN
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('scheduled_at', { ascending: true });
    
    if (bookingsError) throw bookingsError;
    if (!bookings || bookings.length === 0) return [];

    // Collect unique profile IDs
    const profileIds = new Set<string>();
    bookings.forEach(booking => {
      profileIds.add(booking.client_id);
      profileIds.add(booking.trainer_id);
    });

    // Fetch profiles in one batch query
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, surname, email, avatarurl')
      .in('id', Array.from(profileIds));

    if (profilesError) throw profilesError;

    // Create a map for quick profile lookup
    const profilesMap = new Map();
    profiles?.forEach(profile => profilesMap.set(profile.id, profile));

    // Merge bookings with profile data
    return bookings.map(booking => ({
      ...booking,
      client: profilesMap.get(booking.client_id) || null,
      trainer: profilesMap.get(booking.trainer_id) || null
    }));
  },

  async getByUserId(userId: string) {
    // Fetch bookings without JOIN
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .or(`client_id.eq.${userId},trainer_id.eq.${userId}`)
      .order('scheduled_at', { ascending: true });
    
    if (bookingsError) throw bookingsError;
    if (!bookings || bookings.length === 0) return [];

    // Collect unique profile IDs
    const profileIds = new Set<string>();
    bookings.forEach(booking => {
      profileIds.add(booking.client_id);
      profileIds.add(booking.trainer_id);
    });

    // Fetch profiles in one batch query
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, surname, email, avatarurl')
      .in('id', Array.from(profileIds));

    if (profilesError) throw profilesError;

    // Create a map for quick profile lookup
    const profilesMap = new Map();
    profiles?.forEach(profile => profilesMap.set(profile.id, profile));

    // Merge bookings with profile data
    return bookings.map(booking => ({
      ...booking,
      client: profilesMap.get(booking.client_id) || null,
      trainer: profilesMap.get(booking.trainer_id) || null
    }));
  },

  async getById(id: string) {
    // Fetch booking without JOIN
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (bookingError) throw bookingError;
    if (!booking) return null;

    // Fetch client and trainer profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, surname, email, avatarurl')
      .in('id', [booking.client_id, booking.trainer_id]);

    if (profilesError) throw profilesError;

    // Create a map for quick profile lookup
    const profilesMap = new Map();
    profiles?.forEach(profile => profilesMap.set(profile.id, profile));

    // Merge booking with profile data
    return {
      ...booking,
      client: profilesMap.get(booking.client_id) || null,
      trainer: profilesMap.get(booking.trainer_id) || null
    };
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
