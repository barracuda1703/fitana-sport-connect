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
    // Get chats with basic data
    const { data: chatsData, error } = await supabase
      .from('chats')
      .select(`
        *,
        messages(id, content, created_at, sender_id, read_at)
      `)
      .or(`client_id.eq.${userId},trainer_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    if (!chatsData) return [];

    // Fetch limited profile data for each chat participant using secure RPC
    const chatsWithProfiles = await Promise.all(
      chatsData.map(async (chat) => {
        const otherUserId = chat.client_id === userId ? chat.trainer_id : chat.client_id;
        
        const { data: profileData } = await supabase
          .rpc('get_limited_profile_for_chat', { profile_user_id: otherUserId });

        // Add profile data based on role
        const profile = profileData?.[0];
        if (chat.client_id === userId) {
          return { ...chat, trainer: profile };
        } else {
          return { ...chat, client: profile };
        }
      })
    );

    return chatsWithProfiles;
  },

  async getUnreadCount(chatId: string, userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId)
      .neq('sender_id', userId)
      .is('read_at', null);

    if (error) throw error;
    return count || 0;
  },

  async markChatAsRead(chatId: string, userId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .neq('sender_id', userId)
      .is('read_at', null);

    if (error) throw error;
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

  async editMessage(messageId: string, content: string) {
    const { error } = await supabase
      .from('messages')
      .update({ 
        content,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId);
    
    if (error) throw error;
  },

  async deleteMessageForUser(messageId: string, userId: string) {
    // Soft delete - add user to deleted_for_users array
    const { data: message } = await supabase
      .from('messages')
      .select('deleted_for_users')
      .eq('id', messageId)
      .single();

    const deletedForUsers = message?.deleted_for_users || [];
    
    const { error } = await supabase
      .from('messages')
      .update({ 
        deleted_for_users: [...deletedForUsers, userId]
      })
      .eq('id', messageId);
    
    if (error) throw error;
  },

  async addReaction(messageId: string, userId: string, emoji: string) {
    const { data: message } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();

    const reactions = (message?.reactions as any[]) || [];
    
    // Check if user already reacted with this emoji
    const existingReaction = reactions.find(
      (r: any) => r.user_id === userId && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      const updatedReactions = reactions.filter(
        (r: any) => !(r.user_id === userId && r.emoji === emoji)
      );
      
      const { error } = await supabase
        .from('messages')
        .update({ reactions: updatedReactions as any })
        .eq('id', messageId);
      
      if (error) throw error;
    } else {
      // Add reaction
      const { error } = await supabase
        .from('messages')
        .update({ 
          reactions: [...reactions, { user_id: userId, emoji }] as any
        })
        .eq('id', messageId);
      
      if (error) throw error;
    }
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
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
