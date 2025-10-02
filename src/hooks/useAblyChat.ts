import { useState, useEffect, useRef, useCallback } from 'react';
import { getAblyClient, reconnectAbly } from '@/lib/ablyClient';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
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

  // Setup Ably realtime (no polling fallback)
  useEffect(() => {
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

    // Hard deadline for attach if ABLY_REQUIRE_REALTIME
    if (FEATURE_FLAGS.ABLY_REQUIRE_REALTIME) {
      attachTimeoutRef.current = setTimeout(() => {
        if (channel.state !== 'attached') {
          console.error('[useAblyChat] Attach timeout');
          setChannelState('failed');
          setError('Nie udało się połączyć z czatem');
        }
      }, FEATURE_FLAGS.ABLY_ATTACH_TIMEOUT);
    }

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
      setError(stateChange.reason?.message || 'Błąd połączenia');
      if (attachTimeoutRef.current) {
        clearTimeout(attachTimeoutRef.current);
      }
    };

    const handleSuspended = () => {
      console.warn('[useAblyChat] Channel suspended');
      setChannelState('suspended');
      setError('Połączenie zawieszone');
    };

    const handleDisconnected = () => {
      console.warn('[useAblyChat] Channel disconnected');
      setChannelState('disconnected');
      setError('Rozłączono');
    };

    channel.on('attached', handleAttached);
    channel.on('failed', handleFailed);
    channel.on('suspended', handleSuspended);
    channel.on('detached', handleDisconnected);

    // Subscribe to messages
    const messageListener = (msg: Ably.Message) => {
      console.debug('[useAblyChat] Received message:', msg.data);
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

    // Presence: join when attached, track all members
    const updatePresence = async () => {
      try {
        const members = await channel.presence.get();
        const otherMembers = members.filter(m => m.clientId !== userId);
        if (onPresence) {
          onPresence(otherMembers.length > 0);
        }
      } catch (err) {
        console.error('[useAblyChat] Failed to get presence:', err);
      }
    };

    channel.presence.enter({ status: 'online' });
    
    channel.presence.subscribe('enter', () => updatePresence());
    channel.presence.subscribe('leave', () => updatePresence());
    channel.presence.subscribe('update', () => updatePresence());

    // Initial presence check
    updatePresence();

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
  }, [chatId, userId, onMessage, onTyping, onPresence]);

  // Publish typing indicator
  const publishTyping = useCallback(
    async (typing: boolean) => {
      if (channelState !== 'attached') return;

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
    
    const ably = getAblyClient();
    if (ably) {
      ably.connection.connect();
      if (ably.auth.authorize) {
        ably.auth.authorize();
      }
    }
    
    if (channelRef.current) {
      channelRef.current.attach();
    }
  }, []);

  return {
    channelState,
    error,
    publishTyping,
    reconnect,
    isConnected: channelState === 'attached',
  };
}
