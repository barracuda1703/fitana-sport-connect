import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Ably from 'ably';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface AblyContextType {
  realtimeClient: Ably.Realtime | null;
  connectionState: string;
  isConnected: boolean;
}

const AblyContext = createContext<AblyContextType>({
  realtimeClient: null,
  connectionState: 'initialized',
  isConnected: false,
});

export const useAbly = () => {
  const context = useContext(AblyContext);
  if (!context) {
    throw new Error('useAbly must be used within AblyProvider');
  }
  return context;
};

export const AblyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [realtimeClient, setRealtimeClient] = useState<Ably.Realtime | null>(null);
  const [connectionState, setConnectionState] = useState<string>('initialized');
  const [isConnected, setIsConnected] = useState(false);
  const ablyClientRef = useRef<Ably.Realtime | null>(null);

  useEffect(() => {
    if (!user) {
      // Cleanup if user logs out
      if (ablyClientRef.current) {
        ablyClientRef.current.close();
        ablyClientRef.current = null;
        setRealtimeClient(null);
        setConnectionState('closed');
        setIsConnected(false);
      }
      return;
    }

    const initAbly = async () => {
      try {
        console.log('[Ably] Initializing for user:', user.id);
        
        // Create Ably Realtime client with token auth
        const client = new Ably.Realtime({
          authCallback: async (tokenParams, callback) => {
            try {
              console.log('[Ably] Requesting token...');
              
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                console.error('[Ably] No session found');
                callback('No session', null);
                return;
              }

              const { data, error } = await supabase.functions.invoke('ably-token', {
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              });

              if (error) {
                console.error('[Ably] Token error:', error);
                callback(error.message, null);
                return;
              }

              console.log('[Ably] Token received successfully');
              callback(null, data);
            } catch (error) {
              console.error('[Ably] Error getting token:', error);
              callback(error instanceof Error ? error.message : 'Auth failed', null);
            }
          },
          echoMessages: false, // Don't echo our own messages
        });

        ablyClientRef.current = client;
        setRealtimeClient(client);

        // Monitor connection state with diagnostics
        client.connection.on('connecting', () => {
          console.log('[Ably] State: connecting');
          setConnectionState('connecting');
          setIsConnected(false);
        });

        client.connection.on('connected', () => {
          console.log('[Ably] State: connected');
          setConnectionState('connected');
          setIsConnected(true);
        });

        client.connection.on('disconnected', (stateChange) => {
          console.log('[Ably] State: disconnected', stateChange.reason || '');
          setConnectionState('disconnected');
          setIsConnected(false);
        });

        client.connection.on('suspended', (stateChange) => {
          console.warn('[Ably] State: suspended', stateChange.reason || '');
          setConnectionState('suspended');
          setIsConnected(false);
        });

        client.connection.on('failed', (stateChange) => {
          console.error('[Ably] State: failed', stateChange.reason?.message || '');
          setConnectionState('failed');
          setIsConnected(false);
        });

        client.connection.on('closed', () => {
          console.log('[Ably] State: closed');
          setConnectionState('closed');
          setIsConnected(false);
        });

        console.log('[Ably] Client initialized');
      } catch (error) {
        console.error('[Ably] Initialization error:', error);
        setConnectionState('failed');
      }
    };

    initAbly();

    return () => {
      if (ablyClientRef.current) {
        console.log('[Ably] Closing connection');
        ablyClientRef.current.close();
        ablyClientRef.current = null;
        setRealtimeClient(null);
        setConnectionState('closed');
        setIsConnected(false);
      }
    };
  }, [user]);

  return (
    <AblyContext.Provider value={{ realtimeClient, connectionState, isConnected }}>
      {children}
    </AblyContext.Provider>
  );
};
