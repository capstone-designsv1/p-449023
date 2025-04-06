
import { env } from "@/config/env";

export type ElevenLabsVoice = 
  | 'alloy'   // Default
  | 'echo'    // Charlie (male)
  | 'fable'   // Domi (female)
  | 'onyx'    // Adam (male)
  | 'nova'    // Sarah (female)
  | 'shimmer'  // Elli (female)
  | 'custom';  // Custom voice ID

/**
 * Directly calls the ElevenLabs API to convert text to speech
 */
export const textToSpeech = async (
  text: string, 
  voiceId: string = 'F9Nt4wN7louPPlCeLCMN' // Default custom voice ID
): Promise<Blob | null> => {
  try {
    // Validate API key
    if (!env.ELEVEN_LABS_API_KEY) {
      console.error('Missing ElevenLabs API key');
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
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get the audio blob
    const audioBlob = await response.blob();
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Received empty audio response from ElevenLabs');
    }

    console.log(`Successfully received audio data of size: ${audioBlob.size} bytes`);
    return audioBlob;
    
  } catch (error) {
    console.error('Error in textToSpeech:', error);
    return null;
  }
};

/**
 * Plays voice response from ElevenLabs
 */
export const playVoiceResponse = async (
  text: string,
  voiceId: string = 'F9Nt4wN7louPPlCeLCMN', 
  onStart?: () => void,
  onEnd?: () => void
): Promise<boolean> => {
  try {
    // Call onStart callback if provided
    if (onStart) onStart();
    
    // Get audio blob from ElevenLabs
    const audioBlob = await textToSpeech(text, voiceId);
    if (!audioBlob) {
      throw new Error('Failed to get audio from ElevenLabs');
    }
    
    // Create audio URL from blob
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Create audio element and set up event handlers
    const audio = new Audio(audioUrl);
    
    // Return a promise that resolves when audio finishes playing
    return new Promise((resolve) => {
      // Setup event handlers
      audio.onended = () => {
        // Cleanup resources
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
        resolve(true);
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
        resolve(false);
      };
      
      // Play the audio
      audio.play().catch(err => {
        console.error('Failed to play audio:', err);
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
        resolve(false);
      });
    });
  } catch (error) {
    console.error('Error playing voice response:', error);
    if (onEnd) onEnd();
    return false;
  }
};
