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

    // Monitor connection state for debugging
    const connectionStateChange = (stateChange: Ably.ConnectionStateChange) => {
      console.debug('[useAblyChat] Connection state:', stateChange.current, {
        previous: stateChange.previous,
        reason: stateChange.reason?.message,
      });
    };
    ably.connection.on(connectionStateChange);

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
      const reason = stateChange.reason;
      const code = reason?.code;
      const message = reason?.message || 'Błąd połączenia';
      
      console.error('[useAblyChat] Channel failed:', {
        code,
        message,
        statusCode: reason?.statusCode,
      });
      
      setChannelState('failed');
      
      // Provide specific error messages based on error code
      if (code && code >= 40100 && code < 40200) {
        setError('Błąd autoryzacji - odśwież stronę');
      } else if (code && code >= 40300 && code < 40400) {
        setError('Brak dostępu do czatu');
      } else if (code && code >= 50000) {
        setError('Błąd serwera - spróbuj ponownie później');
      } else {
        setError(message);
      }
      
      if (attachTimeoutRef.current) {
        clearTimeout(attachTimeoutRef.current);
      }
    };

    const handleSuspended = () => {
      console.warn('[useAblyChat] Channel suspended - will auto-reconnect');
      setChannelState('suspended');
      setError(null); // Don't show error for suspended - Ably will reconnect automatically
    };

    const handleDisconnected = () => {
      console.warn('[useAblyChat] Channel disconnected');
      setChannelState('disconnected');
      setError(null); // Don't show error for normal disconnect
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

    // Presence: join AFTER attached, track all members
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

    // Subscribe to presence changes
    channel.presence.subscribe('enter', () => updatePresence());
    channel.presence.subscribe('leave', () => updatePresence());
    channel.presence.subscribe('update', () => updatePresence());

    // Subscribe to attached event to enter presence
    channel.once('attached', () => {
      console.debug('[useAblyChat] Channel attached, entering presence');
      // Enter presence after successful attach
      channel.presence.enter({ status: 'online' });
      // Initial presence check
      updatePresence();
    });

    // Attach channel
    channel.attach();

    return () => {
      console.debug('[useAblyChat] Cleaning up');
      if (attachTimeoutRef.current) {
        clearTimeout(attachTimeoutRef.current);
      }
      
      const ably = getAblyClient();
      if (ably) {
        ably.connection.off(connectionStateChange);
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

  // Reconnect - only reconnect connection and channel, not auth
  const reconnect = useCallback(() => {
    console.debug('[useAblyChat] Manual reconnect requested');
    setError(null);
    setChannelState('connecting');
    
    const ably = getAblyClient();
    if (ably) {
      // Only reconnect connection - Ably will handle token refresh automatically
      ably.connection.connect();
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
