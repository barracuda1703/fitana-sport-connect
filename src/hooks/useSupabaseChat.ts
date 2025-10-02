import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, REALTIME_LISTEN_TYPES } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Message = Database['public']['Tables']['messages']['Row'];

interface UseSupabaseChatOptions {
  chatId: string;
  userId: string;
  onNewMessage: (message: any) => void;
  onTyping?: (isTyping: boolean) => void;
  onPresence?: (isOnline: boolean) => void;
}

type ChannelStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export function useSupabaseChat({
  chatId,
  userId,
  onNewMessage,
  onTyping,
  onPresence,
}: UseSupabaseChatOptions) {
  const [channelStatus, setChannelStatus] = useState<ChannelStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const subscribeTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup function
  const cleanup = useCallback(async () => {
    if (subscribeTimeoutRef.current) {
      clearTimeout(subscribeTimeoutRef.current);
    }
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  // Initialize channel and subscriptions
  useEffect(() => {
    if (!chatId || !userId) return;

    console.log('[Supabase Chat] useEffect triggered - Initializing channel:', { chatId, userId, timestamp: Date.now() });
    setChannelStatus('connecting');
    setError(null);

    const channelName = `chat:${chatId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: userId },
        broadcast: { self: false }, // don't echo own typing
      },
    });

    channelRef.current = channel;

    // 1. Subscribe to postgres_changes for new messages
    channel.on(
      'postgres_changes' as REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        const newMessage = payload.new as Message;
        console.log('[Supabase Chat] New message via realtime:', newMessage.id);
        
        // Only process if not from current user (avoid duplicates with optimistic UI)
        if (newMessage.sender_id !== userId) {
          onNewMessage({
            id: newMessage.id,
            text: newMessage.content,
            senderId: newMessage.sender_id,
            timestamp: new Date(newMessage.created_at!).getTime(),
            imageUrl: newMessage.image_url || undefined,
          });
        }
      }
    );

    // 2. Subscribe to presence for online status
    channel.on(
      'presence' as REALTIME_LISTEN_TYPES.PRESENCE,
      { event: 'sync' },
      () => {
        const state = channel.presenceState();
        const otherUsers = Object.keys(state).filter(id => id !== userId);
        const isOnline = otherUsers.length > 0;
        console.log('[Supabase Chat] Presence sync - other users online:', isOnline);
        setIsOtherUserOnline(isOnline);
        onPresence?.(isOnline);
      }
    );

    channel.on(
      'presence' as REALTIME_LISTEN_TYPES.PRESENCE,
      { event: 'join' },
      ({ key }) => {
        if (key !== userId) {
          console.log('[Supabase Chat] User joined:', key);
          setIsOtherUserOnline(true);
          onPresence?.(true);
        }
      }
    );

    channel.on(
      'presence' as REALTIME_LISTEN_TYPES.PRESENCE,
      { event: 'leave' },
      ({ key }) => {
        if (key !== userId) {
          console.log('[Supabase Chat] User left:', key);
          const state = channel.presenceState();
          const otherUsers = Object.keys(state).filter(id => id !== userId);
          const isOnline = otherUsers.length > 0;
          setIsOtherUserOnline(isOnline);
          onPresence?.(isOnline);
        }
      }
    );

    // 3. Subscribe to broadcast for typing indicators
    if (onTyping) {
      channel.on(
        'broadcast' as REALTIME_LISTEN_TYPES.BROADCAST,
        { event: 'typing' },
        ({ payload }) => {
          if (payload.userId !== userId) {
            console.log('[Supabase Chat] Typing event:', payload.typing);
            onTyping(payload.typing);
            
            // Auto-clear typing after 3s
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (payload.typing) {
              typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
              }, 3000);
            }
          }
        }
      );
    }

    // Subscribe to channel with timeout
    subscribeTimeoutRef.current = setTimeout(() => {
      // Check if channel still exists (not yet subscribed)
      if (channelRef.current) {
        console.error('[Supabase Chat] Subscribe timeout after 10s');
        setChannelStatus('error');
        setError(new Error('Timeout podczas łączenia z czatem'));
      }
    }, 10000); // 10s timeout

    channel.subscribe(async (status, err) => {
      if (subscribeTimeoutRef.current) {
        clearTimeout(subscribeTimeoutRef.current);
      }
      
      console.log('[Supabase Chat] Subscribe callback:', { status, err, timestamp: Date.now() });
      
      if (status === 'SUBSCRIBED') {
        setChannelStatus('connected');
        setError(null);
        
        // Track presence after successful subscribe
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
        console.log('[Supabase Chat] Presence tracked');
      } else if (status === 'CLOSED') {
        setChannelStatus('disconnected');
      } else if (status === 'CHANNEL_ERROR') {
        setChannelStatus('error');
        setError(err || new Error('Błąd połączenia z czatem'));
      }
    });

    return () => {
      console.log('[Supabase Chat] useEffect cleanup triggered');
      cleanup();
    };
  }, [chatId, userId, onNewMessage, onTyping, onPresence]);

  // Publish typing indicator
  const publishTyping = useCallback(async (isTyping: boolean) => {
    if (!channelRef.current || channelStatus !== 'connected') {
      console.warn('[Supabase Chat] Cannot publish typing - not connected');
      return;
    }
    
    await channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, typing: isTyping },
    });
  }, [userId, channelStatus]);

  // Reconnect function
  const reconnect = useCallback(async () => {
    console.log('[Supabase Chat] Manual reconnect triggered');
    await cleanup();
    setChannelStatus('idle'); // This will trigger useEffect to reinitialize
  }, [cleanup]);

  return {
    channelStatus,
    error,
    isOtherUserOnline,
    publishTyping,
    reconnect,
    isConnected: channelStatus === 'connected',
  };
}
