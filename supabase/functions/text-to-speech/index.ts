
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process binary to base64 in improved chunks to prevent memory issues
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 1024; // Use smaller chunk size for more reliable processing
  let base64 = '';
  
  try {
    // Process in chunks to avoid stack overflow
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
      const binaryString = Array.from(chunk)
        .map(byte => String.fromCharCode(byte))
        .join('');
      
      base64 += btoa(binaryString);
    }
    
    console.log(`Generated base64 string of length: ${base64.length}`);
    
    // Basic validation of base64 output
    if (!base64 || base64.length === 0) {
      throw new Error("Generated empty base64 string");
    }
    
    return base64;
  } catch (error) {
    console.error("Error in arrayBufferToBase64:", error);
    throw new Error(`Base64 encoding error: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!ELEVEN_LABS_API_KEY) {
      console.error("Missing ElevenLabs API key");
      throw new Error("ELEVEN_LABS_API_KEY is not set");
    }

    // Parse request body
    const requestData = await req.json();
    const { text, voice } = requestData;

    if (!text) {
      console.error("Missing text parameter");
      throw new Error('Text is required');
    }

    console.log(`Converting text to speech with ElevenLabs. Text length: ${text.length}, Voice ID: ${voice || 'default custom voice'}`);

    // Always use the provided voice ID, or fall back to the custom one
    const voiceId = voice || 'F9Nt4wN7louPPlCeLCMN';

    // Log the API endpoint and voice ID being used
    const apiEndpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    console.log(`Calling ElevenLabs API: ${apiEndpoint}`);

    // Generate speech from text using ElevenLabs API
    const response = await fetch(apiEndpoint, {
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

    // Check for API response error
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error (${response.status}):`);
      console.error(errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText.substring(0, 100)}`);
    }

    // Get binary audio data
    const audioBuffer = await response.arrayBuffer();
    
    // Validate audio buffer
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      console.error("Received empty audio buffer from ElevenLabs API");
      throw new Error("Received empty audio buffer from ElevenLabs API");
    }
    
    console.log(`Received audio data of size: ${audioBuffer.byteLength} bytes`);
    
    // Convert binary to base64 with improved error handling
    try {
      const base64Audio = arrayBufferToBase64(audioBuffer);
      console.log(`Successfully converted to base64 string of length: ${base64Audio.length}`);
      
      // Return the result
      return new Response(
        JSON.stringify({ audioContent: base64Audio }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    } catch (encodingError) {
      console.error("Error encoding audio:", encodingError);
      throw new Error(`Failed to encode audio response: ${encodingError.message}`);
    }
  } catch (error) {
    console.error("Error in text-to-speech function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        errorDetails: error.stack 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
