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
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const connectionMonitor = useRef<NodeJS.Timeout | null>(null);

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
        
        // Create Ably Realtime client with token auth and retry logic
        const client = new Ably.Realtime({
          authCallback: async (tokenParams, callback) => {
            const startTime = performance.now();
            let lastError: any = null;
            
            // Try up to 3 times with session refresh
            for (let attempt = 1; attempt <= 3; attempt++) {
              try {
                console.log(`[Ably] Token request attempt ${attempt}/3`);
                
                // Refresh session before each attempt to ensure fresh token
                const { data: { session: refreshedSession }, error: refreshError } = 
                  await supabase.auth.refreshSession();
                
                if (refreshError || !refreshedSession) {
                  console.error(`[Ably] Session refresh failed on attempt ${attempt}:`, refreshError);
                  lastError = refreshError || new Error('No session after refresh');
                  
                  // Wait before retry with exponential backoff
                  if (attempt < 3) {
                    const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    console.log(`[Ably] Waiting ${backoffMs}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, backoffMs));
                    continue;
                  }
                  break;
                }

                console.log('[Ably] Session refreshed, requesting token...');
                const { data, error } = await supabase.functions.invoke('ably-token', {
                  headers: {
                    Authorization: `Bearer ${refreshedSession.access_token}`,
                  },
                });

                if (error) {
                  console.error(`[Ably] Token error on attempt ${attempt}:`, error);
                  lastError = error;
                  
                  if (attempt < 3) {
                    const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    await new Promise(resolve => setTimeout(resolve, backoffMs));
                    continue;
                  }
                  break;
                }

                const elapsed = Math.round(performance.now() - startTime);
                console.log(`[Ably] Token received successfully in ${elapsed}ms`);
                callback(null, data);
                return;
              } catch (error) {
                console.error(`[Ably] Error on attempt ${attempt}:`, error);
                lastError = error;
                
                if (attempt < 3) {
                  const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                  await new Promise(resolve => setTimeout(resolve, backoffMs));
                  continue;
                }
              }
            }
            
            // All attempts failed
            const errorMessage = lastError instanceof Error ? lastError.message : 'Auth failed after 3 attempts';
            console.error('[Ably] All token attempts failed:', errorMessage);
            callback(errorMessage, null);
          },
          echoMessages: false,
          disconnectedRetryTimeout: 5000,
          suspendedRetryTimeout: 10000,
        });

        ablyClientRef.current = client;
        setRealtimeClient(client);

        // Monitor connection state with diagnostics and auto-recovery
        client.connection.on('connecting', () => {
          console.log('[Ably] State: connecting');
          setConnectionState('connecting');
          setIsConnected(false);
          reconnectAttempts.current = 0;
        });

        client.connection.on('connected', () => {
          console.log('[Ably] State: connected');
          setConnectionState('connected');
          setIsConnected(true);
          reconnectAttempts.current = 0;
          
          // Clear any reconnect timer
          if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = null;
          }
          
          // Start connection monitoring
          if (connectionMonitor.current) {
            clearInterval(connectionMonitor.current);
          }
          connectionMonitor.current = setInterval(() => {
            if (client.connection.state === 'connected') {
              console.log('[Ably] Connection stable');
            }
          }, 30000);
        });

        client.connection.on('disconnected', (stateChange) => {
          console.warn('[Ably] State: disconnected', stateChange.reason?.message || '');
          setConnectionState('disconnected');
          setIsConnected(false);
          
          // Auto-reconnect with exponential backoff
          const attempt = reconnectAttempts.current++;
          const backoffMs = Math.min(5000 * Math.pow(1.5, attempt), 30000);
          
          console.log(`[Ably] Auto-reconnect in ${backoffMs}ms (attempt ${attempt + 1})`);
          reconnectTimer.current = setTimeout(() => {
            if (client.connection.state === 'disconnected' || client.connection.state === 'suspended') {
              console.log('[Ably] Triggering reconnect...');
              client.connect();
            }
          }, backoffMs);
        });

        client.connection.on('suspended', (stateChange) => {
          console.warn('[Ably] State: suspended', stateChange.reason?.message || '');
          setConnectionState('suspended');
          setIsConnected(false);
          
          // More aggressive reconnect for suspended state
          const backoffMs = 10000;
          console.log(`[Ably] Auto-reconnect from suspended in ${backoffMs}ms`);
          
          reconnectTimer.current = setTimeout(() => {
            if (client.connection.state === 'suspended') {
              console.log('[Ably] Triggering reconnect from suspended...');
              client.connect();
            }
          }, backoffMs);
        });

        client.connection.on('failed', (stateChange) => {
          console.error('[Ably] State: failed', stateChange.reason?.message || '', stateChange.reason?.code || '');
          setConnectionState('failed');
          setIsConnected(false);
          reconnectAttempts.current = 0;
          
          if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = null;
          }
        });

        client.connection.on('closed', () => {
          console.log('[Ably] State: closed');
          setConnectionState('closed');
          setIsConnected(false);
          
          if (connectionMonitor.current) {
            clearInterval(connectionMonitor.current);
            connectionMonitor.current = null;
          }
        });

        console.log('[Ably] Client initialized with auto-recovery');
      } catch (error) {
        console.error('[Ably] Initialization error:', error);
        setConnectionState('failed');
      }
    };

    initAbly();

    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      
      if (connectionMonitor.current) {
        clearInterval(connectionMonitor.current);
        connectionMonitor.current = null;
      }
      
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
