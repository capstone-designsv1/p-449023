
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

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
    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not set");
    }

    const { text, voice } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`Converting text to speech with voice ${voice || 'en-US-Neural2-F'}...`);

    // Map simple voice names to Google's more complex voice names
    const voiceMapping: Record<string, string> = {
      'alloy': 'en-US-Neural2-F', // Female voice
      'echo': 'en-US-Neural2-C',  // Female voice (different style)
      'fable': 'en-US-Neural2-F', // Female voice
      'onyx': 'en-US-Neural2-D',  // Male voice
      'nova': 'en-US-Neural2-A',  // Female voice
      'shimmer': 'en-US-Neural2-E' // Female voice
    };

    // Use the mapped voice or default
    const googleVoice = voiceMapping[voice] || 'en-US-Neural2-F';
    const gender = googleVoice.includes('-D') || googleVoice.includes('-J') ? 'MALE' : 'FEMALE';

    // Generate speech from text using Google Cloud Text-to-Speech API
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          text: text
        },
        voice: {
          languageCode: 'en-US',
          name: googleVoice,
          ssmlGender: gender
        },
        audioConfig: {
          audioEncoding: 'MP3'
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API error:", errorText);
      throw new Error(`Google API error: ${errorText}`);
    }

    console.log("Text-to-speech conversion successful");
    
    // The response contains the audio content as a base64 encoded string
    const result = await response.json();
    const base64Audio = result.audioContent;

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
