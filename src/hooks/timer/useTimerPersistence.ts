
import { TimerState } from './types';

export function useTimerPersistence(challengeId: string) {
  const saveTimer = (timerState: TimerState) => {
    if (!timerState.isLoading && timerState.totalMinutes > 0) {
      const timerToSave = {
        ...timerState,
        savedAt: Date.now()
      };
      
      localStorage.setItem(`challenge_timer_${challengeId}`, JSON.stringify(timerToSave));
    }
  };

  const loadSavedTimer = (): { timerRestored: boolean; restoredState?: TimerState } => {
    try {
      const savedTimerKey = `challenge_timer_${challengeId}`;
      const savedTimer = localStorage.getItem(savedTimerKey);
      
      if (savedTimer) {
        const parsedTimer = JSON.parse(savedTimer);
        
        // Check if the timer is still valid (not expired and not too old)
        const now = Date.now();
        const savedAt = parsedTimer.savedAt || 0;
        const timeElapsedSinceLastSave = Math.floor((now - savedAt) / 1000);
        
        // If the timer was saved and the remaining time is still positive
        if (parsedTimer.secondsRemaining > timeElapsedSinceLastSave) {
          const updatedSecondsRemaining = parsedTimer.secondsRemaining - timeElapsedSinceLastSave;
          
          const restoredState: TimerState = {
            totalMinutes: parsedTimer.totalMinutes,
            secondsRemaining: updatedSecondsRemaining,
            isActive: true,
            isLoading: false,
            error: null
          };
          
          return { 
            timerRestored: true,
            restoredState
          };
        }
      }
      return { timerRestored: false };
    } catch (error) {
      console.error("Error loading saved timer:", error);
      return { timerRestored: false };
    }
  };

  const clearTimer = () => {
    localStorage.removeItem(`challenge_timer_${challengeId}`);
  };

  return {
    saveTimer,
    loadSavedTimer,
    clearTimer
  };
}
