import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  booking_id?: string;
  client_id: string;
  trainer_id: string;
  rating: number;
  comment?: string;
  photos: string[];
  trainer_reply?: {
    comment: string;
    repliedAt: string;
  };
  created_at: string;
  updated_at: string;
}

export const reviewsService = {
  async getByTrainerId(trainerId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        client:profiles!reviews_client_id_fkey (
          id,
          name,
          surname,
          avatarurl
        )
      `)
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addTrainerReply(reviewId: string, reply: string) {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        trainer_reply: {
          comment: reply,
          repliedAt: new Date().toISOString()
        }
      })
      .eq('id', reviewId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
