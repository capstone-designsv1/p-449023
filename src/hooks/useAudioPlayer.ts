
import { useState, useEffect } from "react";
import { useAudioResources } from "./audio/useAudioResources";
import { useAudioEvents } from "./audio/useAudioEvents";
import { useAudioPlayback } from "./audio/useAudioPlayback";

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
  
  // Get audio resources management
  const {
    audioRef,
    audioUrlRef,
    cleanupTimerRef,
    cleanupAudioResources
  } = useAudioResources();
  
  // Get audio event handlers
  const {
    handleAudioEnded,
    handleAudioError
  } = useAudioEvents({
    cleanupAudioResources,
    setIsPlaying,
    onPlaybackEnd
  });
  
  // Get audio playback controls
  const {
    playAudio,
    stopAudio
  } = useAudioPlayback({
    audioRef,
    audioUrlRef,
    isPlaying,
    setIsPlaying,
    handleAudioEnded,
    handleAudioError,
    cleanupAudioResources,
    onPlaybackStart,
    onPlaybackEnd
  });

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
  }, [audioRef, handleAudioEnded, handleAudioError, cleanupAudioResources]);

  return {
    isPlaying,
    playAudio,
    stopAudio,
    cleanupAudioResources
  };
};
