import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[Ably Token] Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode JWT directly instead of calling Supabase Auth API
    let userId: string;
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
      
      if (!userId) {
        throw new Error('No user ID in token');
      }
      
      console.log('[Ably Token] Decoded user ID from JWT:', userId);
    } catch (decodeError) {
      console.error('[Ably Token] JWT decode error:', decodeError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client for data queries only
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    console.log('[Ably Token] Generating token for user:', userId);

    // Get all chats for this user to create capabilities
    const { data: userChats, error: chatsError } = await supabase
      .from('chats')
      .select('id')
      .or(`client_id.eq.${userId},trainer_id.eq.${userId}`);

    if (chatsError) {
      console.error('[Ably Token] Error fetching user chats:', chatsError);
      return new Response(
        JSON.stringify({ error: 'Error fetching chats' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create capability object for all user's chats
    const capabilities: Record<string, string[]> = {};
    (userChats || []).forEach(chat => {
      capabilities[`chat:${chat.id}`] = ['subscribe', 'publish', 'presence', 'history'];
    });

    console.log('[Ably Token] Creating token with capabilities for', Object.keys(capabilities).length, 'chats');

    const ablyApiKey = Deno.env.get('ABLY_API_KEY');
    if (!ablyApiKey) {
      throw new Error('ABLY_API_KEY not configured');
    }

    // Parse the API key to get key name and secret
    const [keyName, keySecret] = ablyApiKey.split(':');
    
    // Create Ably token request with capabilities for all user's chats
    const tokenRequest = {
      keyName,
      clientId: userId,
      capability: JSON.stringify(capabilities),
      timestamp: Date.now(),
      ttl: 3600000, // 1 hour
    };

    // Create HMAC signature
    const encoder = new TextEncoder();
    const message = encoder.encode(
      `${tokenRequest.keyName}\n${tokenRequest.ttl}\n${tokenRequest.capability}\n${tokenRequest.clientId}\n${tokenRequest.timestamp}`
    );
    
    const keyData = encoder.encode(keySecret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
    const mac = btoa(String.fromCharCode(...new Uint8Array(signature)));

    const token = {
      ...tokenRequest,
      mac,
    };

    console.log('[Ably Token] Generated successfully for user:', userId, 'with', Object.keys(capabilities).length, 'channels');

    return new Response(
      JSON.stringify(token),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating Ably token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
