import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/integrations/supabase/types';

export interface ChatRealtimeCallbacks {
  onInsert: (message: Message) => void;
  onUpdate: (message: Message) => void;
  getSinceTs: () => string | null;
  setSinceTs: (ts: string) => void;
}

export interface ChatRealtimeOptions {
  chatId: string;
  onInsert: (message: Message) => void;
  onUpdate: (message: Message) => void;
  getSinceTs: () => string | null;
  setSinceTs: (ts: string) => void;
}

/**
 * Subscribe to chat realtime events with gap-fill on reconnect
 */
export function subscribeChat(options: ChatRealtimeOptions): () => void {
  const { chatId, onInsert, onUpdate, getSinceTs, setSinceTs } = options;
  
  console.log('[ChatRealtime] Subscribing to chat:', chatId);
  
  const channel = supabase
    .channel(`chat:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      },
      (payload) => {
        console.log('[ChatRealtime] INSERT event:', payload);
        const message = payload.new as Message;
        onInsert(message);
        setSinceTs(message.created_at);
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
        console.log('[ChatRealtime] UPDATE event:', payload);
        const message = payload.new as Message;
        onUpdate(message);
        setSinceTs(message.updated_at || message.created_at);
      }
    )
    .subscribe((status) => {
      console.log('[ChatRealtime] Subscription status:', status);
      
      // On reconnect, perform gap-fill
      if (status === 'SUBSCRIBED') {
        const sinceTs = getSinceTs();
        if (sinceTs) {
          console.log('[ChatRealtime] Performing gap-fill since:', sinceTs);
          fetchMessagesSince(chatId, sinceTs)
            .then(messages => {
              console.log('[ChatRealtime] Gap-fill messages:', messages.length);
              messages.forEach(message => {
                onInsert(message);
                setSinceTs(message.created_at);
              });
            })
            .catch(error => {
              console.error('[ChatRealtime] Gap-fill error:', error);
            });
        }
      }
    });

  return () => {
    console.log('[ChatRealtime] Unsubscribing from chat:', chatId);
    supabase.removeChannel(channel);
  };
}

/**
 * Fetch messages since a specific timestamp
 */
export async function fetchMessagesSince(chatId: string, sinceIso: string): Promise<Message[]> {
  console.log('[ChatRealtime] Fetching messages since:', sinceIso);
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .gt('created_at', sinceIso)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[ChatRealtime] Error fetching messages:', error);
    throw error;
  }

  return data || [];
}

/**
 * Send a message (delegate to existing service)
 */
export async function sendMessage(input: {
  chatId: string;
  senderId: string;
  content: string;
}): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: input.chatId,
      sender_id: input.senderId,
      content: input.content,
    })
    .select()
    .single();

  if (error) {
    console.error('[ChatRealtime] Error sending message:', error);
    throw error;
  }

  return data;
}

/**
 * Deduplicate messages by ID
 */
export function dedupeById(messages: Message[]): Message[] {
  const seen = new Set<string>();
  return messages.filter(message => {
    if (seen.has(message.id)) {
      return false;
    }
    seen.add(message.id);
    return true;
  });
}

/**
 * Get the latest timestamp from messages
 */
export function getLatestTimestamp(messages: Message[]): string | null {
  if (messages.length === 0) return null;
  
  return messages
    .map(m => m.updated_at || m.created_at)
    .sort()
    .pop() || null;
}
