
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
    
    console.log(`Attempting to play audio from URL: ${url}`);
    
    // Clean up any existing audio
    cleanupAudioResources();
    
    try {
      setIsPlaying(true);
      if (onPlaybackStart) onPlaybackStart();
      
      // Set new URL
      audioUrlRef.current = url;
      
      // Ensure we have a valid audio element
      if (!audioRef.current) {
        console.log("Creating new Audio element");
        audioRef.current = new Audio();
        audioRef.current.addEventListener('ended', handleAudioEnded);
        audioRef.current.addEventListener('error', handleAudioError);
      }
      
      const audio = audioRef.current;
      
      // Validate URL before using it
      if (!url || !url.startsWith('blob:')) {
        console.error(`Invalid audio URL format: ${url}`);
        throw new Error("Invalid audio URL format");
      }
      
      // Set the source
      console.log(`Setting audio source to ${url}`);
      audio.src = url;
      
      // Wait for audio to be loaded with timeout
      await new Promise<void>((resolve, reject) => {
        const loadHandler = () => {
          console.log("Audio loadedmetadata event fired");
          audio.removeEventListener('loadedmetadata', loadHandler);
          audio.removeEventListener('error', errorHandler);
          resolve();
        };
        
        const errorHandler = (e: Event) => {
          console.error("Audio load error event fired:", e);
          const audioElement = e.target as HTMLAudioElement;
          const errorMessage = audioElement.error ? 
            `Audio error: ${audioElement.error.code} - ${audioElement.error.message}` : 
            'Unknown audio error';
          
          audio.removeEventListener('loadedmetadata', loadHandler);
          audio.removeEventListener('error', errorHandler);
          reject(new Error(errorMessage));
        };
        
        // Add event listeners
        audio.addEventListener('loadedmetadata', loadHandler);
        audio.addEventListener('error', errorHandler);
        
        // Set a timeout to handle cases where audio loading hangs
        const timeoutId = setTimeout(() => {
          audio.removeEventListener('loadedmetadata', loadHandler);
          audio.removeEventListener('error', errorHandler);
          reject(new Error('Audio loading timed out'));
        }, 10000); // 10 second timeout
        
        // Start loading the audio
        console.log("Starting audio load");
        audio.load();
      });
      
      console.log("Audio loaded successfully, attempting to play");
      
      // Check if user has interacted with the page
      const userInteracted = document.documentElement.hasAttribute('data-user-interacted');
      
      if (!userInteracted) {
        console.log("No user interaction detected, waiting for interaction");
        // Show a message prompting user action
        toast.info("Click anywhere to enable audio playback");
        
        // Mark that we've shown this message
        document.documentElement.setAttribute('data-user-interacted', 'true');
        
        // Wait for user interaction before playing
        const playOnInteraction = () => {
          console.log("User interaction detected, attempting to play audio");
          audio.play()
            .catch((error) => {
              console.error("Play after interaction failed:", error);
              toast.error("Please click again to enable audio playback");
            });
          
          document.removeEventListener('click', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction, { once: true });
      } else {
        console.log("User has previously interacted with the page, playing immediately");
        // Attempt to play with proper error handling
        try {
          await audio.play();
          console.log("Audio playback started successfully");
        } catch (error) {
          console.error("Audio play failed:", error);
          
          // If autoplay failed due to browser restrictions, show a helpful message
          if (error instanceof Error && error.name === 'NotAllowedError') {
            toast.error("Browser blocked autoplay. Please click anywhere to enable audio.");
            
            // Set up a one-time click handler to play audio
            const clickHandler = () => {
              audio.play()
                .then(() => console.log("Audio playback started after click"))
                .catch(e => console.error("Play after click failed:", e));
              
              document.removeEventListener('click', clickHandler);
            };
            
            document.addEventListener('click', clickHandler, { once: true });
          } else {
            toast.error("Failed to play audio. Please try again.");
            cleanupAudioResources();
            setIsPlaying(false);
            if (onPlaybackEnd) onPlaybackEnd();
          }
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
    console.log("Stop audio requested");
    if (audioRef.current && !audioRef.current.paused) {
      console.log("Stopping audio playback");
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      cleanupAudioResources();
      setIsPlaying(false);
      if (onPlaybackEnd) onPlaybackEnd();
      console.log("Audio playback stopped");
    } else {
      console.log("No active audio playback to stop");
    }
  }, [audioRef, onPlaybackEnd, cleanupAudioResources, setIsPlaying]);

  return {
    playAudio,
    stopAudio
  };
};
