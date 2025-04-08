
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends audio to the speech-to-text service and returns the transcription
 */
export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  try {
    console.log(`Sending audio data to speech-to-text function, data length: ${base64Audio?.length || 0}`);
    
    const response = await supabase.functions.invoke('speech-to-text', {
      body: { audio: base64Audio }
    });
    
    if (response.error) {
      console.error('Supabase function error:', response.error);
      throw new Error(response.error.message || 'Failed to transcribe audio');
    }
    
    // Log the entire response to help debug
    console.log('Speech-to-text function response:', JSON.stringify(response));
    
    if (response.data) {
      if (response.data.error) {
        console.error('Speech-to-text function returned error:', response.data.error);
        throw new Error(response.data.error);
      }
      
      if (response.data.text) {
        console.log(`Transcription successful: "${response.data.text}"`);
        return response.data.text;
      } else {
        console.error('No transcription text returned from function');
        throw new Error('No transcription text returned from function');
      }
    } else {
      console.error('No data returned from speech-to-text function');
      throw new Error('Failed to get response data from transcription service');
    }
  } catch (error) {
    console.error('Transcription error details:', error);
    throw error;
  }
};
