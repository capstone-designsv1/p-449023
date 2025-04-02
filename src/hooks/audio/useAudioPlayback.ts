// src/hooks/audio/useAudioPlayback.ts - Updated implementation
import { useState, useRef, useEffect } from 'react';

export function useAudioPlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  
  // Clean up previous audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);
  
  const playAudio = (audioUrl: string) => {
    setError(null);
    setIsPending(true);
    
    try {
      // Clean up previous audio URL if it exists
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      // Store the new URL
      audioUrlRef.current = audioUrl;
      
      // Create a new audio element each time
      const audio = new Audio(audioUrl);
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Failed to play audio. Please try again.');
        setIsPlaying(false);
        setIsPending(false);
      };
      
      audio.oncanplaythrough = () => {
        setIsPending(false);
        setIsPlaying(true);
        audio.play().catch(e => {
          console.error('Audio play error:', e);
          setError(`Play error: ${e.message}`);
          setIsPlaying(false);
          setIsPending(false);
        });
      };
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      // Store reference to the audio element
      audioRef.current = audio;
    } catch (e) {
      console.error('Audio setup error:', e);
      setError(`Audio setup error: ${e.message}`);
      setIsPlaying(false);
      setIsPending(false);
    }
  };
  
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };
  
  return {
    playAudio,
    stopAudio,
    isPlaying,
    isPending,
    error
  };
}
