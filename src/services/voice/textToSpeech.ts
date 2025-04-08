
/**
 * Core text-to-speech functionality
 */

import { env } from "@/config/env";
import { toast } from "sonner";
import { isElevenLabsConfigured } from "./voiceConfig";

/**
 * Directly calls the ElevenLabs API to convert text to speech
 */
export const textToSpeech = async (
  text: string, 
  voiceId: string
): Promise<Blob | null> => {
  try {
    // Validate API key
    if (!isElevenLabsConfigured()) {
      console.error('Missing ElevenLabs API key');
      toast.error('ElevenLabs API key is missing. Please add it to your .env.local file.');
      
      // Show more detailed instructions
      toast.error(
        'Add VITE_ELEVEN_LABS_API_KEY=your_api_key_here to .env.local file in project root',
        { duration: 5000 }
      );
      
      throw new Error('ElevenLabs API key is required. Please add it to your environment variables.');
    }

    // Validate input
    if (!text || typeof text !== 'string' || text.trim() === '') {
      console.error('Invalid or empty text provided');
      throw new Error('Valid text input is required');
    }

    // Log the attempt with limited text preview
    console.log(`Converting text to speech. Text length: ${text.length}, Preview: "${text.substring(0, 30)}..."`);
    
    // Make direct API call to ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': env.ELEVEN_LABS_API_KEY,
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

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error (${response.status}):`, errorText);
      
      if (response.status === 401) {
        toast.error('Invalid ElevenLabs API key. Please check your API key and try again.');
        toast.error('Make sure you have added your API key to the .env.local file');
        throw new Error('ElevenLabs authentication failed. Check your API key.');
      } else if (response.status === 422) {
        toast.error('Voice ID is invalid. Please check your voice settings.');
        throw new Error('Invalid voice ID or parameters.');
      } else {
        toast.error(`ElevenLabs API error: ${response.status}`);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
    }

    // Get the audio blob
    const audioBlob = await response.blob();
    if (!audioBlob || audioBlob.size === 0) {
      toast.error('Received empty audio response from ElevenLabs');
      throw new Error('Received empty audio response from ElevenLabs');
    }

    console.log(`Successfully received audio data of size: ${audioBlob.size} bytes`);
    return audioBlob;
    
  } catch (error) {
    console.error('Error in textToSpeech:', error);
    // Error toast is shown in the function that calls this one
    return null;
  }
};
