import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Improved base64 encoding function
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 3 * 1024; // Use a multiple of 3 to avoid padding issues
  let base64 = '';
  
  try {
    // Process in chunks to avoid stack overflow
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
      const binaryChunk = Array.from(chunk).map(b => String.fromCharCode(b)).join('');
      
      try {
        const encodedChunk = btoa(binaryChunk);
        base64 += encodedChunk;
      } catch (encodeError) {
        console.error("Error encoding chunk to base64:", encodeError);
        throw new Error(`Failed to encode audio chunk at position ${i}`);
      }
    }
    
    return base64;
  } catch (error) {
    console.error("Error in arrayBufferToBase64:", error);
    throw new Error("Failed to encode audio data to base64: " + error.message);
  }
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
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    // The response contains the audio as binary data
    const audioBuffer = await response.arrayBuffer();
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      throw new Error("Received empty audio buffer from ElevenLabs API");
    }
    
    console.log(`Received audio data of size: ${audioBuffer.byteLength} bytes`);
    
    // Instead of converting to base64, return the audio data directly as an audio/mpeg response
    // This approach avoids base64 encoding/decoding issues entirely
    if (req.headers.get('accept') === 'audio/mpeg') {
      console.log("Returning audio data directly as audio/mpeg");
      return new Response(audioBuffer, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString()
        },
      });
    }
    
    // If client expects JSON with base64, provide that
    try {
      const base64Audio = arrayBufferToBase64(audioBuffer);
      console.log(`Converted to base64 string of length: ${base64Audio.length}`);
      
      // Return base64 data with proper data URI prefix for direct browser usage
      return new Response(
        JSON.stringify({ 
          audioContent: base64Audio,
          audioDataUri: `data:audio/mpeg;base64,${base64Audio}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    } catch (encodingError) {
      console.error("Error encoding audio:", encodingError);
      throw new Error("Failed to encode audio response: " + encodingError.message);
    }
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

