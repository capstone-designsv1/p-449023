
import { supabase } from "@/integrations/supabase/client";
import { base64ToBlob, createAudioUrl } from "@/utils/audioHelpers";
import { toast } from "sonner";

/**
 * Voice options for text-to-speech
 */
export type ElevenLabsVoice = 
  | 'alloy'   // Rachel (female) - default
  | 'echo'    // Charlie (male)
  | 'fable'   // Domi (female)
  | 'onyx'    // Adam (male)
  | 'nova'    // Sarah (female)
  | 'shimmer'  // Elli (female)
  | 'custom'; // Custom voice ID

interface TextToSpeechResponse {
  audioUrl: string | null;
  error: Error | null;
}

/**
 * Convert text to speech using Eleven Labs API via Supabase Edge Function
 */
export const convertTextToSpeech = async (
  text: string, 
  customVoiceId?: string
): Promise<TextToSpeechResponse> => {
  try {
    console.log("Sending TTS request with text:", text.substring(0, 50) + "...");
    
    // Call the Supabase Edge Function
    const response = await supabase.functions.invoke('text-to-speech', {
      body: { 
        text, 
        voice: customVoiceId // Pass the custom voice ID
      }
    });
    
    console.log("TTS response received:", response);
    
    if (response.error) {
      throw new Error(response.error.message || "Error from text-to-speech function");
    }
    
    if (!response.data || !response.data.audioContent) {
      throw new Error('No audio content received');
    }
    
    // Process the audio content
    const audioContent = response.data.audioContent;
    console.log("Audio content length:", audioContent?.length || 0);
    
    // Validate base64 content
    if (!audioContent || audioContent.trim() === '') {
      throw new Error('Empty audio content received');
    }
    
    // Convert base64 to blob and create URL with proper error handling
    const blob = base64ToBlob(audioContent, 'audio/mp3');
    if (!blob) {
      throw new Error('Failed to convert audio content to blob');
    }
    
    const url = createAudioUrl(blob);
    if (!url) {
      throw new Error('Failed to create audio URL');
    }
    
    console.log("Created audio URL:", url);
    
    return {
      audioUrl: url,
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
