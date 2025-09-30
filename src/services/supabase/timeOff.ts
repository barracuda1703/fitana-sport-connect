import { supabase } from '@/integrations/supabase/client';

export interface TimeOff {
  id: string;
  trainer_id: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  note?: string;
  created_at: string;
}

export interface ManualBlock {
  id: string;
  trainer_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export const timeOffService = {
  async getByTrainerId(trainerId: string) {
    const { data, error } = await supabase
      .from('time_off')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(timeOff: Omit<TimeOff, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('time_off')
      .insert(timeOff)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('time_off')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

export const manualBlocksService = {
  async getByTrainerId(trainerId: string) {
    const { data, error } = await supabase
      .from('manual_blocks')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(block: Omit<ManualBlock, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('manual_blocks')
      .insert(block)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('manual_blocks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
