
import { useCallback } from "react";
import { toast } from "sonner";

interface UseAudioPlaybackProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  audioUrlRef: React.MutableRefObject<string | null>;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  handleAudioEnded: (e: Event) => void;
  handleAudioError: (e: Event) => void;
  cleanupAudioResources: () => void;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
}

/**
 * Hook to manage audio playback controls
 */
export const useAudioPlayback = ({
  audioRef,
  audioUrlRef,
  isPlaying,
  setIsPlaying,
  handleAudioEnded,
  handleAudioError,
  cleanupAudioResources,
  onPlaybackStart,
  onPlaybackEnd
}: UseAudioPlaybackProps) => {
  
  // Play audio with a given URL
  const playAudio = useCallback(async (url: string): Promise<void> => {
    if (!url || isPlaying) return;
    
    // Clean up any existing audio
    cleanupAudioResources();
    
    try {
      setIsPlaying(true);
      if (onPlaybackStart) onPlaybackStart();
      
      // Set new URL
      audioUrlRef.current = url;
      
      // Ensure we have a valid audio element
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener('ended', handleAudioEnded);
        audioRef.current.addEventListener('error', handleAudioError);
      }
      
      const audio = audioRef.current;
      
      // Ensure src is set before attempting to play
      if (!url) {
        throw new Error("Invalid audio URL");
      }
      
      audio.src = url;
      
      // Wait for audio to be loaded
      await new Promise<void>((resolve, reject) => {
        const loadHandler = () => {
          audio.removeEventListener('loadedmetadata', loadHandler);
          audio.removeEventListener('error', errorHandler);
          resolve();
        };
        
        const errorHandler = (e: Event) => {
          audio.removeEventListener('loadedmetadata', loadHandler);
          audio.removeEventListener('error', errorHandler);
          reject(new Error(`Audio load error: ${audio.error?.message || 'Unknown error'}`));
        };
        
        audio.addEventListener('loadedmetadata', loadHandler);
        audio.addEventListener('error', errorHandler);
        audio.load();
      });
      
      // Use a user interaction detection to handle autoplay restrictions
      const userInteracted = document.documentElement.hasAttribute('data-user-interacted');
      
      if (!userInteracted) {
        // If no interaction detected, show a message prompting user action
        toast.info("Click anywhere to enable audio playback");
        
        // Mark that we've shown this message
        document.documentElement.setAttribute('data-user-interacted', 'true');
        
        // Wait for user interaction before playing
        const playOnInteraction = () => {
          const playPromise = audio.play();
          if (playPromise) {
            playPromise.catch((error) => {
              console.error("Autoplay prevented:", error);
              toast.error("Please click to enable audio playback");
            });
          }
          document.removeEventListener('click', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction, { once: true });
      } else {
        // Attempt to play with proper error handling
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Play promise error:", error);
            
            // If autoplay failed due to browser restrictions, show a helpful message
            if (error.name === 'NotAllowedError') {
              toast.error("Browser blocked autoplay. Please click anywhere to enable audio.");
              
              // Set up a one-time click handler to play audio
              const clickHandler = () => {
                audio.play().catch(e => console.error("Play after click failed:", e));
                document.removeEventListener('click', clickHandler);
              };
              
              document.addEventListener('click', clickHandler, { once: true });
            } else {
              toast.error("Failed to play audio. Please try again.");
            }
            
            cleanupAudioResources();
            setIsPlaying(false);
            if (onPlaybackEnd) onPlaybackEnd();
          });
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play audio. Please try again.');
      cleanupAudioResources();
      setIsPlaying(false);
      if (onPlaybackEnd) onPlaybackEnd();
    }
  }, [isPlaying, onPlaybackStart, onPlaybackEnd, audioRef, audioUrlRef, cleanupAudioResources, handleAudioEnded, handleAudioError, setIsPlaying]);

  // Stop audio playback
  const stopAudio = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      console.log("Stopping audio playback");
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      cleanupAudioResources();
      setIsPlaying(false);
      if (onPlaybackEnd) onPlaybackEnd();
      console.log("Audio playback stopped");
    }
  }, [audioRef, onPlaybackEnd, cleanupAudioResources, setIsPlaying]);

  return {
    playAudio,
    stopAudio
  };
};
