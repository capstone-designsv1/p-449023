
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTimerPersistence } from './useTimerPersistence';
import { useTimerDuration } from './useTimerDuration';
import { useTimerFormatters } from './useTimerFormatters';
import { TimerState, UseChallengeTimerProps } from './types';

export function useChallengeTimer({
  challengeId,
  designLevel,
  industry,
  title,
  description,
  onTimeExpired
}: UseChallengeTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>({
    totalMinutes: 0,
    secondsRemaining: 0,
    isActive: false,
    isLoading: true,
    error: null
  });

  const { saveTimer, loadSavedTimer, clearTimer } = useTimerPersistence(challengeId);
  const { fetchSuggestedTime } = useTimerDuration();
  const { formatTimeRemaining, getTimeRemainingPercentage } = useTimerFormatters(timerState);

  // Load timer state from localStorage on init
  useEffect(() => {
    const initializeTimer = async () => {
      // Try to load saved timer first
      const { timerRestored, restoredState } = loadSavedTimer();
      
      // If no timer was restored, fetch a new suggested time
      if (!timerRestored) {
        const { totalMinutes, secondsRemaining } = await fetchSuggestedTime(
          title, 
          description, 
          designLevel, 
          industry
        );
        
        setTimerState({
          totalMinutes,
          secondsRemaining,
          isActive: true,
          isLoading: false,
          error: null
        });
      } else if (restoredState) {
        setTimerState(restoredState);
      }
    };

    initializeTimer();
  }, [challengeId]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    saveTimer(timerState);
  }, [timerState]);

  // Timer countdown logic
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (timerState.isActive && timerState.secondsRemaining > 0) {
      intervalId = window.setInterval(() => {
        setTimerState(prev => {
          const newSecondsRemaining = prev.secondsRemaining - 1;
          
          // Check if timer has expired
          if (newSecondsRemaining <= 0) {
            if (intervalId) clearInterval(intervalId);
            
            // Clean up the timer from localStorage
            clearTimer();
            
            // Call the expired callback
            setTimeout(() => {
              onTimeExpired();
            }, 0);
            
            return {
              ...prev,
              secondsRemaining: 0,
              isActive: false
            };
          }
          
          return {
            ...prev,
            secondsRemaining: newSecondsRemaining
          };
        });
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerState.isActive, timerState.secondsRemaining, onTimeExpired]);

  // Show a notification when the timer is first set
  useEffect(() => {
    if (timerState.totalMinutes > 0 && !timerState.isLoading) {
      toast.info(`You have ${timerState.totalMinutes} minutes to complete this challenge`, {
        duration: 5000
      });
    }
  }, [timerState.totalMinutes, timerState.isLoading]);

  // Reset timer function
  const resetTimer = async () => {
    const { totalMinutes, secondsRemaining } = await fetchSuggestedTime(
      title,
      description,
      designLevel,
      industry
    );
    
    setTimerState({
      totalMinutes,
      secondsRemaining,
      isActive: true,
      isLoading: false,
      error: null
    });
  };

  return {
    timeRemaining: formatTimeRemaining(),
    timeRemainingPercentage: getTimeRemainingPercentage(),
    secondsRemaining: timerState.secondsRemaining,
    isActive: timerState.isActive,
    isLoading: timerState.isLoading,
    error: timerState.error,
    totalMinutes: timerState.totalMinutes,
    resetTimer
  };
}
