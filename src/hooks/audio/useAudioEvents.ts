
import { useCallback } from "react";
import { toast } from "sonner";

interface UseAudioEventsProps {
  cleanupAudioResources: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  onPlaybackEnd?: () => void;
}

/**
 * Hook to manage audio event handlers
 */
export const useAudioEvents = ({
  cleanupAudioResources,
  setIsPlaying,
  onPlaybackEnd,
}: UseAudioEventsProps) => {
  // Event handler for normal audio playback end
  const handleAudioEnded = useCallback((e: Event) => {
    console.log("Audio playback ended normally");
    cleanupAudioResources();
    setIsPlaying(false);
    if (onPlaybackEnd) onPlaybackEnd();
  }, [cleanupAudioResources, setIsPlaying, onPlaybackEnd]);
  
  // Event handler for audio errors
  const handleAudioError = useCallback((e: Event) => {
    const audio = e.target as HTMLAudioElement;
    const error = audio?.error;
    
    console.error("Audio playback error:", e);
    console.error("Audio error code:", error?.code);
    console.error("Audio error message:", error?.message);
    
    toast.error("Failed to play audio. Please try again.");
    cleanupAudioResources();
    setIsPlaying(false);
    if (onPlaybackEnd) onPlaybackEnd();
  }, [cleanupAudioResources, setIsPlaying, onPlaybackEnd]);

  return {
    handleAudioEnded,
    handleAudioError
  };
};
