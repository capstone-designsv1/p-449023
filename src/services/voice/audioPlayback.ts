
/**
 * Audio playback functionality
 */

import { toast } from "sonner";
import { textToSpeech } from "./textToSpeech";
import { isElevenLabsConfigured } from "./voiceConfig";

/**
 * Plays voice response from ElevenLabs
 */
export const playVoiceResponse = async (
  text: string,
  voiceId: string, 
  onStart?: () => void,
  onEnd?: () => void
): Promise<boolean> => {
  try {
    // Check if API key is configured before attempting
    if (!isElevenLabsConfigured()) {
      toast.error('ElevenLabs API key is missing. Voice features are disabled.');
      toast.error('Add VITE_ELEVEN_LABS_API_KEY=your_api_key_here to .env.local file in project root', 
        { duration: 5000 });
      return false;
    }
    
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
