
// src/services/textToSpeechService.ts
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks and validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://abhynrggccdsyfeibegh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHlucmdnY2Nkc3lmZWliZWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNTYxNzMsImV4cCI6MjA1ODYzMjE3M30.cKdYZ5DD0D-YK6V5n5JEJuP-vSI1ux4xngBTTQ4HAyY';

// Validate supabase URL and key to prevent runtime errors
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check environment variables.');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Exported function to convert text to speech
export async function convertTextToSpeech(text: string, voiceId: string, model: string = 'eleven_monolingual_v1') {
  try {
    console.log(`Converting text to speech: "${text.substring(0, 20)}..."`, { voiceId, model });
    
    // Generate a unique ID for this request
    const requestId = `tts-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { text, voiceId, model, requestId },
    });
    
    if (error) {
      console.error('TTS Edge Function error:', error);
      throw new Error(`TTS Edge Function error: ${error.message}`);
    }
    
    if (!data || !data.audio) {
      console.error('Invalid TTS response:', data);
      throw new Error('Invalid or empty response from TTS service');
    }
    
    // Validate base64 string
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(data.audio)) {
      console.error('Invalid base64 data received');
      throw new Error('Invalid base64 audio data received');
    }
    
    // Convert base64 to blob with proper validation
    try {
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      
      // Create and return blob URL
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('Audio conversion successful, URL created:', audioUrl);
      return audioUrl;
    } catch (e) {
      console.error('Base64 decoding error:', e);
      throw new Error(`Failed to decode audio data: ${e.message}`);
    }
  } catch (error) {
    console.error('Text-to-speech service error:', error);
    throw error;
  }
}
