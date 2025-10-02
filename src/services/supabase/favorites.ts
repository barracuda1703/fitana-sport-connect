import { supabase } from '@/integrations/supabase/client';

export interface Favorite {
  id: string;
  user_id: string;
  trainer_id: string;
  created_at: string;
}

export const favoritesService = {
  async toggle(userId: string, trainerId: string): Promise<boolean> {
    // Check if already favorited
    const { data: existing } = await (supabase as any)
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('trainer_id', trainerId)
      .maybeSingle();

    if (existing) {
      // Remove favorite
      const { error } = await (supabase as any)
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('trainer_id', trainerId);

      if (error) throw error;
      return false; // Unfavorited
    } else {
      // Add favorite
      const { error } = await (supabase as any)
        .from('favorites')
        .insert({
          user_id: userId,
          trainer_id: trainerId
        });

      if (error) throw error;
      return true; // Favorited
    }
  },

  async getAll(userId: string): Promise<string[]> {
    const { data, error } = await (supabase as any)
      .from('favorites')
      .select('trainer_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((f: any) => f.trainer_id);
  },

  async isFavorite(userId: string, trainerId: string): Promise<boolean> {
    const { data } = await (supabase as any)
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('trainer_id', trainerId)
      .maybeSingle();

    return !!data;
  },

  subscribeToChanges(userId: string, callback: () => void): () => void {
    const channel = supabase
      .channel('favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
