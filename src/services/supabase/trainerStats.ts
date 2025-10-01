import { supabase } from '@/integrations/supabase/client';

export interface TrainerStats {
  trainer_id: string;
  rating: number | null;
  review_count: number;
  completed_trainings: number;
}

export const trainerStatsService = {
  async getByUserId(userId: string): Promise<TrainerStats | null> {
    const { data, error } = await supabase
      .from('trainer_stats_v1')
      .select('*')
      .eq('trainer_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching trainer stats:', error);
      throw error;
    }
    
    return data;
  }
};
