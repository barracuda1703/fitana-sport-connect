import { useState, useEffect, useRef, useCallback } from 'react';
import { getAblyClient, reconnectAbly } from '@/lib/ablyClient';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { chatsService } from '@/services/supabase/chats';
import type * as Ably from 'ably';

export type ChannelState = 
  | 'idle' 
  | 'connecting' 
  | 'attaching' 
  | 'attached' 
  | 'disconnected' 
  | 'suspended' 
  | 'failed';

interface UseAblyChatOptions {
  chatId: string;
  userId: string;
  onMessage: (message: any) => void;
  onTyping?: (isTyping: boolean) => void;
  onPresence?: (isOnline: boolean) => void;
}

export function useAblyChat({
  chatId,
  userId,
  onMessage,
  onTyping,
  onPresence,
}: UseAblyChatOptions) {
  const [channelState, setChannelState] = useState<ChannelState>('idle');
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const attachTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track which messages we've already loaded to prevent duplicates
  const loadedMessagesRef = useRef<Set<string>>(new Set());

  // Load messages from DB (polling fallback or initial load)
  const loadMessages = useCallback(async () => {
    try {
      const messages = await chatsService.getMessages(chatId);
      messages.forEach((msg: any) => {
        const messageId = msg.id;
        // Only call onMessage for new messages we haven't seen yet
        if (!loadedMessagesRef.current.has(messageId)) {
          loadedMessagesRef.current.add(messageId);
          onMessage({
            id: msg.id,
            text: msg.content,
            senderId: msg.sender_id,
            timestamp: new Date(msg.created_at).getTime(),
            imageUrl: msg.image_url,
          });
        }
      });
    } catch (err: any) {
      console.error('[useAblyChat] Failed to load messages:', err);
    }
  }, [chatId, onMessage]);

  // Reset tracked messages when chatId changes
  useEffect(() => {
    loadedMessagesRef.current.clear();
  }, [chatId]);

  // Setup Ably or polling
  useEffect(() => {
    if (!FEATURE_FLAGS.ABLY_ENABLED) {
      console.debug('[useAblyChat] Using polling mode');
      setChannelState('attached'); // Pretend attached for UI

      // Initial load
      loadMessages();

      // Poll every 10s
      pollingIntervalRef.current = setInterval(loadMessages, FEATURE_FLAGS.POLLING_INTERVAL);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }

    // Ably mode
    const ably = getAblyClient();
    if (!ably) {
      setChannelState('failed');
      setError('Ably client not initialized');
      return;
    }

    const channelName = `chat:${chatId}`;
    console.debug('[useAblyChat] Attaching to channel:', channelName);
    
    const channel = ably.channels.get(channelName);
    channelRef.current = channel;
    setChannelState('attaching');

    // Safety timeout to prevent endless "attaching"
    attachTimeoutRef.current = setTimeout(() => {
      if (channelState === 'attaching') {
        console.warn('[useAblyChat] Attach timeout, falling back to polling');
        setChannelState('suspended');
        loadMessages(); // Load messages via polling
      }
    }, FEATURE_FLAGS.ABLY_ATTACH_TIMEOUT);

    // Monitor channel state
    const handleAttached = () => {
      console.debug('[useAblyChat] Channel attached');
      setChannelState('attached');
      setError(null);
      if (attachTimeoutRef.current) {
        clearTimeout(attachTimeoutRef.current);
      }
    };

    const handleFailed = (stateChange: Ably.ChannelStateChange) => {
      console.error('[useAblyChat] Channel failed:', stateChange.reason?.message);
      setChannelState('failed');
      setError(stateChange.reason?.message || 'Unknown error');
      if (attachTimeoutRef.current) {
        clearTimeout(attachTimeoutRef.current);
      }
    };

    const handleSuspended = () => {
      console.warn('[useAblyChat] Channel suspended');
      setChannelState('suspended');
    };

    channel.on('attached', handleAttached);
    channel.on('failed', handleFailed);
    channel.on('suspended', handleSuspended);

    // Subscribe to messages
    const messageListener = (msg: Ably.Message) => {
      console.debug('[useAblyChat] Received message:', msg.data);
      const messageId = msg.data.id;
      // Track this message to prevent duplicate on next poll
      loadedMessagesRef.current.add(messageId);
      onMessage(msg.data);
    };
    channel.subscribe('message', messageListener);

    // Subscribe to typing
    if (onTyping) {
      const typingListener = (msg: Ably.Message) => {
        const { userId: typingUserId, typing } = msg.data;
        if (typingUserId !== userId) {
          onTyping(typing);
        }
      };
      channel.subscribe('typing', typingListener);
    }

    // Subscribe to presence
    if (onPresence) {
      channel.presence.enter({ status: 'online' });
      
      channel.presence.subscribe('enter', (member) => {
        if (member.clientId !== userId) {
          onPresence(true);
        }
      });

      channel.presence.subscribe('leave', (member) => {
        if (member.clientId !== userId) {
          onPresence(false);
        }
      });
    }

    // Attach
    channel.attach();

    return () => {
      console.debug('[useAblyChat] Cleaning up');
      if (attachTimeoutRef.current) {
        clearTimeout(attachTimeoutRef.current);
      }
      if (channel) {
        channel.presence.leave();
        channel.unsubscribe();
        channel.detach();
      }
      channelRef.current = null;
    };
  }, [chatId, userId, onMessage, onTyping, onPresence, loadMessages, channelState]);

  // Publish message
  const publishMessage = useCallback(
    async (message: any) => {
      if (!FEATURE_FLAGS.ABLY_ENABLED || channelState !== 'attached') {
        // Polling mode or not attached - message will appear on next poll
        return;
      }

      const channel = channelRef.current;
      if (!channel) return;

      try {
        await channel.publish('message', message);
      } catch (err: any) {
        console.error('[useAblyChat] Failed to publish:', err);
        throw err;
      }
    },
    [channelState]
  );

  // Publish typing indicator
  const publishTyping = useCallback(
    async (typing: boolean) => {
      if (!FEATURE_FLAGS.ABLY_ENABLED || channelState !== 'attached') return;

      const channel = channelRef.current;
      if (!channel) return;

      try {
        await channel.publish('typing', { userId, typing });
      } catch (err: any) {
        console.error('[useAblyChat] Failed to publish typing:', err);
      }
    },
    [channelState, userId]
  );

  // Reconnect
  const reconnect = useCallback(() => {
    console.debug('[useAblyChat] Reconnecting...');
    setError(null);
    setChannelState('connecting');
    reconnectAbly();
    
    if (channelRef.current) {
      channelRef.current.attach();
    }
  }, []);

  return {
    channelState,
    error,
    publishMessage,
    publishTyping,
    reconnect,
    isConnected: channelState === 'attached',
    isPollingMode: !FEATURE_FLAGS.ABLY_ENABLED,
  };
}
