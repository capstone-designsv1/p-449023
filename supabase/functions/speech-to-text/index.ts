
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is not set in environment variables");
      throw new Error("GOOGLE_API_KEY is not set");
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Failed to parse request JSON:", error);
      throw new Error("Invalid request format: " + error.message);
    }

    const { audio } = requestBody;
    
    if (!audio) {
      console.error("No audio data provided in request");
      throw new Error('No audio data provided');
    }

    // Validate audio data
    if (typeof audio !== 'string' || audio.length < 100) {
      console.error(`Invalid audio data received. Length: ${audio?.length || 0}`);
      throw new Error('Invalid audio data format');
    }

    console.log(`Received audio data, length: ${audio.length}. Processing...`);
    
    // Convert base64 audio to a recognizable format
    // Google Speech-to-Text accepts base64 directly, so no need to process
    // into binary like we did with OpenAI
    
    console.log("Sending to Google Speech-to-Text API...");
    
    // Send to Google Cloud Speech-to-Text API
    try {
      const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
            model: 'latest_long', // Use a model suitable for conversations
            enableAutomaticPunctuation: true,
          },
          audio: {
            content: audio // Direct base64 input
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google API error (${response.status}):`, errorText);
        throw new Error(`Google API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log("Google API result:", JSON.stringify(result));
      
      let transcribedText = '';
      
      if (result.results && result.results.length > 0) {
        transcribedText = result.results
          .map((result: any) => result.alternatives[0].transcript)
          .join(' ');
        console.log("Transcription successful:", transcribedText);
      } else {
        console.warn("No transcription results returned");
        transcribedText = '';
      }

      return new Response(
        JSON.stringify({ text: transcribedText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError) {
      console.error("Error making request to Google API:", fetchError);
      throw new Error(`Error connecting to Google API: ${fetchError.message}`);
    }

  } catch (error) {
    console.error("Error in speech-to-text function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        errorType: error.name,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
