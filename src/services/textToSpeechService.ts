// src/services/textToSpeechService.ts - Updated implementation
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
