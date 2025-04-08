
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends audio to the speech-to-text service and returns the transcription
 */
export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  try {
    const response = await supabase.functions.invoke('speech-to-text', {
      body: { audio: base64Audio }
    });
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (response.data && response.data.text) {
      return response.data.text;
    } else {
      throw new Error('Failed to transcribe audio');
    }
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};
