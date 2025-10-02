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
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('Generating Ably token for user:', user.id);

    const { userId } = await req.json();
    
    if (userId !== user.id) {
      console.error('User ID mismatch:', userId, 'vs', user.id);
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all chats for this user to create capabilities
    const { data: userChats, error: chatsError } = await supabase
      .from('chats')
      .select('id')
      .or(`client_id.eq.${user.id},trainer_id.eq.${user.id}`);

    if (chatsError) {
      console.error('Error fetching user chats:', chatsError);
      return new Response(
        JSON.stringify({ error: 'Error fetching chats' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create capability object for all user's chats
    const capabilities: Record<string, string[]> = {};
    (userChats || []).forEach(chat => {
      capabilities[`chat-${chat.id}`] = ['subscribe', 'publish', 'presence', 'history'];
    });

    console.log('Creating token with capabilities for', Object.keys(capabilities).length, 'chats');

    const ablyApiKey = Deno.env.get('ABLY_API_KEY');
    if (!ablyApiKey) {
      throw new Error('ABLY_API_KEY not configured');
    }

    // Parse the API key to get key name and secret
    const [keyName, keySecret] = ablyApiKey.split(':');
    
    // Create Ably token request with capabilities for all user's chats
    const tokenRequest = {
      keyName,
      clientId: user.id,
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

    console.log('Generated Ably token for user:', user.id);

    return new Response(
      JSON.stringify({ token }),
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
