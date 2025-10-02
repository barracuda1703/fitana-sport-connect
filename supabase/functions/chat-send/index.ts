import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import * as Ably from "npm:ably@2.14.0";

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
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode JWT to get user ID
    let userId: string;
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
      
      if (!userId) {
        throw new Error('No user ID in token');
      }
    } catch (decodeError) {
      console.error('[chat-send] JWT decode error:', decodeError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { chatId, content, imageUrl } = await req.json();

    if (!chatId || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing chatId or content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is participant
    const { data: participant, error: participantError } = await supabase
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .or(`client_id.eq.${userId},trainer_id.eq.${userId}`)
      .maybeSingle();

    if (participantError || !participant) {
      console.error('[chat-send] User not participant:', participantError);
      return new Response(
        JSON.stringify({ error: 'Not a participant' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert message into DB
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: userId,
        content,
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (insertError || !message) {
      console.error('[chat-send] Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to insert message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update chat updated_at
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    // Publish to Ably
    const ablyApiKey = Deno.env.get('ABLY_API_KEY');
    if (!ablyApiKey) {
      console.error('[chat-send] ABLY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Ably not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const ably = new Ably.Rest(ablyApiKey);
      const channel = ably.channels.get(`chat:${chatId}`);
      
      await channel.publish('message', {
        id: message.id,
        text: message.content,
        senderId: message.sender_id,
        timestamp: new Date(message.created_at).getTime(),
        imageUrl: message.image_url,
      });

      console.log('[chat-send] Published to Ably:', chatId, message.id);
    } catch (ablyError) {
      console.error('[chat-send] Ably publish error:', ablyError);
      // Don't fail the request if Ably fails - message is in DB
    }

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[chat-send] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
