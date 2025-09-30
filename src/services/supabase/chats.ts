import { supabase } from '@/integrations/supabase/client';

export interface Chat {
  id: string;
  client_id: string;
  trainer_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  read_at?: string;
  created_at: string;
}

export const chatsService = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        client:profiles!chats_client_id_fkey (
          id,
          name,
          surname,
          avatarurl
        ),
        trainer:profiles!chats_trainer_id_fkey (
          id,
          name,
          surname,
          avatarurl
        ),
        messages (
          id,
          content,
          sender_id,
          read_at,
          created_at
        )
      `)
      .or(`client_id.eq.${userId},trainer_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getOrCreate(clientId: string, trainerId: string) {
    // Try to find existing chat
    const { data: existing, error: fetchError } = await supabase
      .from('chats')
      .select('*')
      .eq('client_id', clientId)
      .eq('trainer_id', trainerId)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    if (existing) return existing;

    // Create new chat
    const { data, error } = await supabase
      .from('chats')
      .insert({ client_id: clientId, trainer_id: trainerId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createForBooking(clientId: string, trainerId: string) {
    // Automatically create a chat when a booking is created/confirmed
    return this.getOrCreate(clientId, trainerId);
  },

  async getMessages(chatId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async sendMessage(chatId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content
      })
      .select()
      .single();
    
    if (error) throw error;

    // Update chat updated_at
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return data;
  },

  async markAsRead(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);
    
    if (error) throw error;
  },

  subscribeToMessages(chatId: string, callback: (message: Message) => void) {
    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
