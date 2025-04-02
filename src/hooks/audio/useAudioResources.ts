
import { useRef, useCallback } from "react";

/**
 * Hook to manage audio resources and cleanup
 */
export const useAudioResources = () => {
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

  return {
    audioRef,
    audioUrlRef,
    cleanupTimerRef,
    cleanupAudioResources
  };
};
