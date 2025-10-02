import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Ably from 'ably';
import { ChatClient } from '@ably/chat';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface AblyContextType {
  chatClient: ChatClient | null;
  isConnected: boolean;
}

const AblyContext = createContext<AblyContextType>({
  chatClient: null,
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
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ablyClientRef = useRef<Ably.Realtime | null>(null);

  useEffect(() => {
    if (!user) {
      // Cleanup if user logs out
      if (ablyClientRef.current) {
        ablyClientRef.current.close();
        ablyClientRef.current = null;
        setChatClient(null);
        setIsConnected(false);
      }
      return;
    }

    const initAbly = async () => {
      try {
        // Create Ably client with token auth
        const realtimeClient = new Ably.Realtime({
          authCallback: async (tokenParams, callback) => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                console.error('No session found for Ably auth');
                callback('No session', null);
                return;
              }

              console.log('Requesting Ably token for user:', user.id);
              
              const response = await supabase.functions.invoke('ably-token', {
                body: { userId: user.id },
              });

              if (response.error) {
                console.error('Ably token error:', response.error);
                callback(response.error.message, null);
                return;
              }

              console.log('Ably token received successfully');
              callback(null, response.data.token);
            } catch (error) {
              console.error('Error getting Ably token:', error);
              callback(error instanceof Error ? error.message : 'Auth failed', null);
            }
          },
          clientId: user.id,
        });

        ablyClientRef.current = realtimeClient;

        // Monitor connection status
        realtimeClient.connection.on('connected', () => {
          console.log('Ably connected');
          setIsConnected(true);
        });

        realtimeClient.connection.on('disconnected', () => {
          console.log('Ably disconnected');
          setIsConnected(false);
        });

        realtimeClient.connection.on('failed', () => {
          console.error('Ably connection failed');
          setIsConnected(false);
        });

        // Create chat client
        const client = new ChatClient(realtimeClient);
        setChatClient(client);

        console.log('Ably chat client initialized');
      } catch (error) {
        console.error('Error initializing Ably:', error);
      }
    };

    initAbly();

    return () => {
      if (ablyClientRef.current) {
        console.log('Closing Ably connection');
        ablyClientRef.current.close();
        ablyClientRef.current = null;
        setChatClient(null);
        setIsConnected(false);
      }
    };
  }, [user]);

  return (
    <AblyContext.Provider value={{ chatClient, isConnected }}>
      {children}
    </AblyContext.Provider>
  );
};
