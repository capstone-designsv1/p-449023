
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface UseAudioPlayerProps {
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
}

/**
 * Hook to manage audio playback with proper cleanup and error handling
 */
export const useAudioPlayer = ({
  onPlaybackStart,
  onPlaybackEnd,
}: UseAudioPlayerProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const cleanupTimerRef = useRef<number | null>(null);
  
  // Cleanup function for audio resources
  const cleanupAudioResources = useCallback(() => {
    if (audioRef.current) {
      // Reset audio element
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    
    // Revoke any existing object URL to prevent memory leaks
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    
    // Clear any existing timers
    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }
  }, []);

  // Create audio element only once during initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      const audio = audioRef.current;
      
      // Add event listeners
      audio.addEventListener('ended', handleAudioEnded);
      audio.addEventListener('error', handleAudioError);
      
      // Cleanup on component unmount
      return () => {
        if (audio) {
          audio.pause();
          audio.src = '';
          audio.removeEventListener('ended', handleAudioEnded);
          audio.removeEventListener('error', handleAudioError);
        }
        
        cleanupAudioResources();
      };
    }
  }, []);
  
  // Event handlers as separate functions for cleanup
  const handleAudioEnded = () => {
    console.log("Audio playback ended normally");
    cleanupAudioResources();
    setIsPlaying(false);
    if (onPlaybackEnd) onPlaybackEnd();
  };
  
  const handleAudioError = (e: Event) => {
    const error = audioRef.current?.error;
    console.error("Audio playback error:", e);
    console.error("Audio error code:", error?.code);
    console.error("Audio error message:", error?.message);
    
    toast.error("Failed to play audio. Please try again.");
    cleanupAudioResources();
    setIsPlaying(false);
    if (onPlaybackEnd) onPlaybackEnd();
  };
  
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
  }, [isPlaying, onPlaybackStart, onPlaybackEnd, cleanupAudioResources]);

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
  }, [onPlaybackEnd, cleanupAudioResources]);

  return {
    isPlaying,
    playAudio,
    stopAudio,
    cleanupAudioResources
  };
};
