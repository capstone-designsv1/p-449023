
import { useRef, useEffect } from "react";

interface UseSilenceDetectionProps {
  isListening: boolean;
  onSilenceDetected: () => void;
  silenceDetectionTime?: number;
}

/**
 * Hook for detecting silence in audio stream
 */
export const useSilenceDetection = ({
  isListening,
  onSilenceDetected,
  silenceDetectionTime = 2000
}: UseSilenceDetectionProps) => {
  const silenceStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Clean up timers
  const cleanupTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Handle audio level changes for silence detection
  const handleAudioLevelChange = (audioLevel: number, threshold = 10) => {
    const now = Date.now();
    
    // If sound is below threshold, check for silence duration
    if (audioLevel < threshold) {
      if (silenceStartTimeRef.current === null) {
        // Mark start of silence period
        silenceStartTimeRef.current = now;
      } else {
        // Check if silence duration has exceeded threshold
        const silenceDuration = now - silenceStartTimeRef.current;
        if (silenceDuration >= silenceDetectionTime) {
          console.log(`SilenceDetection: Silence detected for ${silenceDuration}ms, triggering callback`);
          onSilenceDetected();
          silenceStartTimeRef.current = null;
        }
      }
    } else {
      // Reset silence timer if sound detected
      if (silenceStartTimeRef.current !== null) {
        console.log("SilenceDetection: Sound detected, resetting silence timer");
        silenceStartTimeRef.current = null;
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, []);

  return {
    handleAudioLevelChange,
    cleanupTimers
  };
};
