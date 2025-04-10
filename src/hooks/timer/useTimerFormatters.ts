
import { useCallback } from 'react';
import { TimerState } from './types';

export function useTimerFormatters(timerState: TimerState) {
  // Format time for display
  const formatTimeRemaining = useCallback(() => {
    const minutes = Math.floor(timerState.secondsRemaining / 60);
    const seconds = timerState.secondsRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timerState.secondsRemaining]);

  // Get percentage of time remaining (for progress bars)
  const getTimeRemainingPercentage = useCallback(() => {
    if (timerState.totalMinutes <= 0) return 100;
    const totalSeconds = timerState.totalMinutes * 60;
    return Math.round((timerState.secondsRemaining / totalSeconds) * 100);
  }, [timerState.secondsRemaining, timerState.totalMinutes]);

  return {
    formatTimeRemaining,
    getTimeRemainingPercentage
  };
}
