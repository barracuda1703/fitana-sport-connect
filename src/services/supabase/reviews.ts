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
    // First, get reviews without JOIN
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!reviews || reviews.length === 0) return [];

    // Collect unique reviewer IDs
    const reviewerIds = [...new Set(reviews.map(r => r.client_id))];

    // Fetch reviewer profiles using secure RPC function
    const { data: profiles, error: profilesError } = await supabase
      .rpc('get_reviewer_profiles', { reviewer_ids: reviewerIds });

    if (profilesError) throw profilesError;

    // Create a map for quick profile lookup
    const profilesMap = new Map();
    profiles?.forEach(profile => profilesMap.set(profile.id, profile));

    // Merge reviews with client profile data
    return reviews.map(review => ({
      ...review,
      client: profilesMap.get(review.client_id) || null
    }));
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
