
// text-to-speech/index.ts - Updated implementation
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

interface ElevenLabsResponse {
  audio: Uint8Array;
  // other fields...
}

// CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { text, voiceId, model, requestId } = await req.json();
    
    console.log(`Processing TTS request ${requestId}: "${text.substring(0, 30)}..."`, { voiceId, model });
    
    // Call Eleven Labs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY') || '',
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Eleven Labs API error (${requestId}):`, errorText);
      return new Response(
        JSON.stringify({ error: `Eleven Labs API error: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get binary audio data
    const audioArrayBuffer = await response.arrayBuffer();
    console.log(`Received audio data (${requestId}): ${audioArrayBuffer.byteLength} bytes`);
    
    if (audioArrayBuffer.byteLength === 0) {
      console.error(`Empty audio response received (${requestId})`);
      return new Response(
        JSON.stringify({ error: "Empty audio response received from Eleven Labs" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Properly encode to base64
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioArrayBuffer))
    );
    
    console.log(`Base64 audio (${requestId}): ${base64Audio.substring(0, 50)}... (length: ${base64Audio.length})`);
    
    // Send properly formatted response
    return new Response(
      JSON.stringify({ audio: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return new Response(
      JSON.stringify({ error: `Text-to-speech error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
