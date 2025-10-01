import { supabase } from '@/integrations/supabase/client';

export interface Invitation {
  id: string;
  trainer_id: string;
  client_email: string;
  client_name?: string;
  booking_id?: string;
  status: 'sent' | 'accepted' | 'expired';
  invitation_data: any;
  created_at: string;
  updated_at: string;
}

export const invitationsService = {
  async create(invitation: Omit<Invitation, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('invitations')
      .insert(invitation)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByTrainerId(trainerId: string) {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: Invitation['status']) {
    const { data, error } = await supabase
      .from('invitations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
