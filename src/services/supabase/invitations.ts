import { supabase } from '@/integrations/supabase/client';

export interface Invitation {
  id: string;
  trainer_id: string;
  client_email: string;
  client_name?: string;
  booking_id?: string;
  status: 'sent' | 'accepted' | 'expired';
  invitation_data: any;
  invitation_token?: string;
  expires_at?: string;
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
    // Use secure RPC function that doesn't expose client_email
    const { data, error } = await supabase
      .rpc('get_trainer_invitations');
    
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
  },

  async acceptByToken(token: string, userId: string) {
    const { data, error } = await supabase
      .rpc('accept_invitation_by_token', {
        token,
        user_id: userId
      });
    
    if (error) throw error;
    return data;
  }
};
