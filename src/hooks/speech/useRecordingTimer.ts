
import { useRef, useCallback } from "react";

interface UseRecordingTimerProps {
  maxRecordingTime: number;
  onMaxTimeReached: () => void;
}

/**
 * Hook to manage recording time limits
 */
export const useRecordingTimer = ({
  maxRecordingTime,
  onMaxTimeReached
}: UseRecordingTimerProps) => {
  const timerRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Start the recording timer
  const startTimer = useCallback(() => {
    recordingStartTimeRef.current = Date.now();
    
    // Set up max recording time
    timerRef.current = window.setTimeout(() => {
      console.log("RecordingTimer: Max recording time reached");
      onMaxTimeReached();
    }, maxRecordingTime);
    
    return recordingStartTimeRef.current;
  }, [maxRecordingTime, onMaxTimeReached]);

  // Clean up timers
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Get recording duration
  const getRecordingDuration = useCallback(() => {
    return recordingStartTimeRef.current ? Date.now() - recordingStartTimeRef.current : 0;
  }, []);

  return {
    startTimer,
    clearTimer,
    getRecordingDuration
  };
};
