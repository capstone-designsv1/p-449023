
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process binary to base64 in chunks to prevent stack overflow
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192; // Process in smaller chunks to avoid stack overflow
  let base64 = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
    const binaryChunk = Array.from(chunk).map(b => String.fromCharCode(b)).join('');
    base64 += btoa(binaryChunk);
  }
  
  return base64;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!ELEVEN_LABS_API_KEY) {
      throw new Error("ELEVEN_LABS_API_KEY is not set");
    }

    const { text, voice } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`Converting text to speech with ElevenLabs voice ID ${voice || 'F9Nt4wN7louPPlCeLCMN'}...`);

    // Always use the provided voice ID, or fall back to the custom one if not provided
    const voiceId = voice || 'F9Nt4wN7louPPlCeLCMN';

    // Generate speech from text using ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
      throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    console.log("Text-to-speech conversion successful");
    
    // The response contains the audio as binary data
    const audioBuffer = await response.arrayBuffer();
    
    // Convert binary to base64 using our chunked method
    const base64Audio = arrayBufferToBase64(audioBuffer);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error("Error in text-to-speech function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
