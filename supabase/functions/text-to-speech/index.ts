// text-to-speech/index.ts - Updated implementation
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

interface ElevenLabsResponse {
  audio: Uint8Array;
  // other fields...
}

serve(async (req) => {
  try {
    const { text, voiceId, model } = await req.json();
    
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
      const error = await response.text();
      console.error('Eleven Labs API error:', error);
      return new Response(
        JSON.stringify({ error: `Eleven Labs API error: ${error}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get binary audio data
    const audioArrayBuffer = await response.arrayBuffer();
    
    // Properly encode to base64
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioArrayBuffer))
    );
    
    // Send properly formatted response
    return new Response(
      JSON.stringify({ audio: base64Audio }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return new Response(
      JSON.stringify({ error: `Text-to-speech error: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
