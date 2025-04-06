
import { env } from "@/config/env";
import { toast } from "sonner";

export type ElevenLabsVoice = 
  | 'alloy'   // Default
  | 'echo'    // Charlie (male)
  | 'fable'   // Domi (female)
  | 'onyx'    // Adam (male)
  | 'nova'    // Sarah (female)
  | 'shimmer'  // Elli (female)
  | 'custom';  // Custom voice ID

// ElevenLabs standard voice IDs for reference
export const ELEVEN_LABS_VOICES = {
  alloy: "pNInz6obpgDQGcFmaJgB",   // Default
  echo: "IKne3meq5aSn9XLyUdCD",    // Charlie (male) 
  fable: "XB0fDUnXU5powFXDhCwa",   // Domi (female)
  onyx: "oWAxZDx7w5VEj9dCyTzz",    // Adam (male)
  nova: "EXAVITQu4vr4xnSDxMaL",    // Sarah (female)
  shimmer: "flq6f7yk4E4fJM5XTYuZ", // Elli (female)
  custom: "F9Nt4wN7louPPlCeLCMN"   // Custom voice ID
};

/**
 * Directly calls the ElevenLabs API to convert text to speech
 */
export const textToSpeech = async (
  text: string, 
  voiceId: string = ELEVEN_LABS_VOICES.custom // Default custom voice ID
): Promise<Blob | null> => {
  try {
    // Validate API key
    if (!env.ELEVEN_LABS_API_KEY) {
      console.error('Missing ElevenLabs API key');
      toast.error('ElevenLabs API key is missing. Please add it to your .env.local file.');
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

/**
 * Plays voice response from ElevenLabs
 */
export const playVoiceResponse = async (
  text: string,
  voiceId: string = ELEVEN_LABS_VOICES.custom, 
  onStart?: () => void,
  onEnd?: () => void
): Promise<boolean> => {
  try {
    // Call onStart callback if provided
    if (onStart) onStart();
    
    // Get audio blob from ElevenLabs
    const audioBlob = await textToSpeech(text, voiceId);
    if (!audioBlob) {
      toast.error('Failed to get audio from ElevenLabs. Check your API key in .env.local file.');
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
        toast.error('Audio playback failed. Please try again.');
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
        resolve(false);
      };
      
      // Play the audio
      audio.play().catch(err => {
        console.error('Failed to play audio:', err);
        if (err.name === 'NotAllowedError') {
          toast.error('Browser blocked audio playback. Please interact with the page first.');
          
          // Add a one-time click handler to try playing again
          const clickHandler = () => {
            audio.play().catch(e => {
              console.error('Retry play failed:', e);
              toast.error('Audio playback still failed. Please try again later.');
            });
            document.removeEventListener('click', clickHandler);
          };
          document.addEventListener('click', clickHandler, { once: true });
        } else {
          toast.error('Failed to play audio. Please try again.');
        }
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

/**
 * Helper function to get voice ID from voice name
 */
export const getVoiceId = (voice: ElevenLabsVoice): string => {
  if (voice === 'custom') {
    return ELEVEN_LABS_VOICES.custom;
  }
  return ELEVEN_LABS_VOICES[voice] || ELEVEN_LABS_VOICES.custom;
};
