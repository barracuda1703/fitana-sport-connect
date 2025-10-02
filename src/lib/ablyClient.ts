import Ably from 'ably';
import { supabase } from '@/integrations/supabase/client';
import { FEATURE_FLAGS } from './featureFlags';

let client: Ably.Realtime | null = null;

/**
 * Get or create Ably Realtime client with token auth
 * Returns null if ABLY_ENABLED is false (use polling fallback)
 */
export function getAblyClient(): Ably.Realtime | null {
  if (!FEATURE_FLAGS.ABLY_ENABLED) {
    console.debug('[Ably] Feature flag disabled, using polling mode');
    return null;
  }

  if (client) return client;

  console.debug('[Ably] Initializing client');

  client = new Ably.Realtime({
    authCallback: async (_params, callback) => {
      try {
        console.debug('[Ably] Requesting token...');
        
        // Get current session without refreshing
        const { data } = await supabase.auth.getSession();
        if (!data.session?.access_token) {
          console.warn('[Ably] No active session');
          callback('No active session', null);
          return;
        }

        const res = await fetch(
          `https://leppkgscskqlukxxulpa.supabase.co/functions/v1/ably-token`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.warn('[Ably] Token error:', res.status, errorText);
          callback(`Token request failed: ${res.status}`, null);
          return;
        }

        const tokenRequest = await res.json();
        console.debug('[Ably] Token received');
        callback(null, tokenRequest);
      } catch (error: any) {
        console.warn('[Ably] Token fetch failed:', error?.message);
        callback(error?.message || 'Unknown error', null);
      }
    },
    echoMessages: false,
    disconnectedRetryTimeout: 5000,
    suspendedRetryTimeout: 10000,
  });

  // Monitor connection state
  client.connection.on('connected', () => {
    console.debug('[Ably] Connected');
    window.dispatchEvent(new CustomEvent('ably:connected'));
  });

  client.connection.on('disconnected', (stateChange) => {
    console.warn('[Ably] Disconnected:', stateChange.reason?.message || '');
    window.dispatchEvent(
      new CustomEvent('ably:disconnected', { detail: stateChange.reason })
    );
  });

  client.connection.on('suspended', (stateChange) => {
    console.warn('[Ably] Suspended:', stateChange.reason?.message || '');
    window.dispatchEvent(
      new CustomEvent('ably:suspended', { detail: stateChange.reason })
    );
  });

  client.connection.on('failed', (stateChange) => {
    console.error('[Ably] Failed:', stateChange.reason?.message || '', stateChange.reason?.code);
    window.dispatchEvent(
      new CustomEvent('ably:failed', { detail: stateChange.reason })
    );
  });

  return client;
}

/**
 * Force reconnect to Ably
 */
export function reconnectAbly() {
  if (!client) return;
  console.debug('[Ably] Forcing reconnect');
  client.connection.connect();
  client.auth.authorize();
}

/**
 * Close Ably connection
 */
export function closeAbly() {
  if (!client) return;
  console.debug('[Ably] Closing connection');
  client.close();
  client = null;
}
