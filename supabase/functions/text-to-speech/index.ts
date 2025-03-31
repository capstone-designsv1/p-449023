
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log(`Converting text to speech with ElevenLabs voice ${voice || 'Rachel'}...`);

    // Map simple voice names to ElevenLabs voice IDs
    // Using a selection of popular ElevenLabs voices
    const voiceMapping: Record<string, string> = {
      'alloy': '21m00Tcm4TlvDq8ikWAM', // Rachel
      'echo': 'IKne3meq5aSn9XLyUdCD', // Charlie
      'fable': 'D38z5RcWu1voky8WS1ja', // Domi
      'onyx': 'AZnzlk1XvdvUeBnXmlld', // Adam
      'nova': 'EXAVITQu4vr4xnSDxMaL', // Sarah
      'shimmer': 'MF3mGyEYCl7XYWbV9V6O' // Elli
    };

    // Use the mapped voice ID or default to Rachel
    const voiceId = voiceMapping[voice] || '21m00Tcm4TlvDq8ikWAM';

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
    
    // Convert binary to base64
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

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
