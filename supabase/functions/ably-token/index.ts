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
      throw new Error('Unauthorized');
    }

    const { chatId } = await req.json();
    
    // Verify user has access to this chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .or(`client_id.eq.${user.id},trainer_id.eq.${user.id}`)
      .single();

    if (chatError || !chat) {
      return new Response(
        JSON.stringify({ error: 'Access denied to this chat' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ablyApiKey = Deno.env.get('ABLY_API_KEY');
    if (!ablyApiKey) {
      throw new Error('ABLY_API_KEY not configured');
    }

    // Parse the API key to get key name and secret
    const [keyName, keySecret] = ablyApiKey.split(':');
    
    // Create Ably token request with capability for specific room
    const tokenRequest = {
      keyName,
      clientId: user.id,
      capability: JSON.stringify({
        [`chat-${chatId}`]: ['subscribe', 'publish', 'presence', 'history']
      }),
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

    console.log('Generated Ably token for user:', user.id, 'chat:', chatId);

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
