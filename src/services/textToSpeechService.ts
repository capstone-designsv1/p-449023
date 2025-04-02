
import { supabase } from "@/integrations/supabase/client";
import { base64ToBlob, createAudioUrl, isValidBase64 } from "@/utils/audioHelpers";
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
    console.log(`Sending TTS request with text: ${text.substring(0, 50)}...`);
    console.log(`Using voice ID: ${customVoiceId || "default"}`);
    
    // Call the Supabase Edge Function with proper error handling
    const response = await supabase.functions.invoke('text-to-speech', {
      body: { 
        text, 
        voice: customVoiceId // Pass the custom voice ID
      }
    });
    
    console.log("TTS response received:", response);
    
    if (response.error) {
      console.error("Supabase function error:", response.error);
      throw new Error(response.error.message || "Error from text-to-speech function");
    }

    if (!response.ok) {
      console.error("Supabase function error:", response.error);
      throw new Error(response.error.message || "Error from ok text-to-speech function");
    }
    
    // if (!response.data) {
    //   console.error("No data received in response");
    //   throw new Error('No response data received');
    // }
    
    // if (!response.data.audioContent) {
    //   console.error("No audio content in response data");
    //   throw new Error('No audio content received');
    // }
    const audiobuf = await response.arrayBuffer();
    // Process the audio content with extensive logging
    const audioContent = response.data.audioContent;
    console.log(`Audio content received, length: ${audioContent?.length || 0} characters`);
    const audioBlob = new Blob([arraybuf]); 
    console.log(audioBlob);
    var audioUrl = URL.createObjectURL(audioBlob);
    // Enhanced validation for base64 content
    // if (!audioContent || audioContent.trim() === '') {
    //   console.error("Empty audio content received");
    //   throw new Error('Empty audio content received');
    // }
    
    // if (!isValidBase64(audioContent)) {
    //   console.error("Invalid base64 encoding in audio response");
    //   throw new Error('Invalid audio content format received');
    // }
    
    // // Convert base64 to blob and create URL with proper error handling
    // console.log("Converting base64 to blob...");
    // const blob = base64ToBlob(audioContent, 'audio/mp3');
    // if (!blob) {
    //   console.error("Failed to convert base64 to blob");
    //   throw new Error('Failed to convert audio content to blob');
    // }
    
    // console.log(`Blob created successfully, size: ${blob.size} bytes`);
    // const url = createAudioUrl(blob);
    // if (!url) {
    //   console.error("Failed to create audio URL from blob");
    //   throw new Error('Failed to create audio URL');
    // }
    
    // console.log("Created audio URL:", url);
    
    return {
      audioUrl: audioUrl,
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
