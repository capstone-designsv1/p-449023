
// This file is kept for backward compatibility
// It now redirects to the new elevenLabsService.ts

import { toast } from "sonner";

// Re-export the types and functions from the new service
export { 
  type ElevenLabsVoice 
} from "./elevenLabsService";

// Import functions from the refactored service
import { textToSpeech } from "./voice/textToSpeech";

interface TextToSpeechResponse {
  audioUrl: string | null;
  error: Error | null;
}

/**
 * Convert text to speech using ElevenLabs API
 * @deprecated Use elevenLabsService.textToSpeech or elevenLabsService.playVoiceResponse directly
 */
export const convertTextToSpeech = async (
  text: string, 
  customVoiceId?: string
): Promise<TextToSpeechResponse> => {
  try {
    console.log(`Sending TTS request with text: ${text.substring(0, 50)}...`);
    console.log(`Using voice ID: ${customVoiceId || "default"}`);
    
    // Get audio blob from ElevenLabs
    const audioBlob = await textToSpeech(text, customVoiceId || "");
    
    if (!audioBlob) {
      throw new Error('Failed to convert text to speech');
    }
    
    // Create URL from blob
    const audioUrl = URL.createObjectURL(audioBlob);
    console.log(`Created audio URL: ${audioUrl}`);
    
    return {
      audioUrl,
      error: null
    };
  } catch (error) {
    console.error('Error converting text to speech:', error);
    toast.error('Failed to convert text to speech');
    return {
      audioUrl: null,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
};
