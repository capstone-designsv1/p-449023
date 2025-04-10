
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseChallengeTimerProps {
  challengeId: string;
  designLevel: string;
  industry: string;
  title: string;
  description: string;
  onTimeExpired: () => void;
}

interface TimerState {
  totalMinutes: number;
  secondsRemaining: number;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
}

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

  // Load timer state from localStorage on init
  useEffect(() => {
    const loadSavedTimer = () => {
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
            
            setTimerState({
              totalMinutes: parsedTimer.totalMinutes,
              secondsRemaining: updatedSecondsRemaining,
              isActive: true,
              isLoading: false,
              error: null
            });
            
            return true; // Timer was restored
          }
        }
        return false; // No valid timer found
      } catch (error) {
        console.error("Error loading saved timer:", error);
        return false;
      }
    };

    // Try to load saved timer first
    const timerRestored = loadSavedTimer();
    
    // If no timer was restored, fetch a new suggested time
    if (!timerRestored) {
      fetchSuggestedTime();
    }
  }, [challengeId]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (!timerState.isLoading && timerState.totalMinutes > 0) {
      const timerToSave = {
        ...timerState,
        savedAt: Date.now()
      };
      
      localStorage.setItem(`challenge_timer_${challengeId}`, JSON.stringify(timerToSave));
    }
  }, [timerState, challengeId]);

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
            localStorage.removeItem(`challenge_timer_${challengeId}`);
            
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
  }, [timerState.isActive, timerState.secondsRemaining, challengeId, onTimeExpired]);

  // Initialize timer with suggested time from the API
  const fetchSuggestedTime = async () => {
    setTimerState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await supabase.functions.invoke('evaluate-challenge-time', {
        body: {
          challengeDetails: {
            title,
            description,
            designLevel,
            industry
          }
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const { suggestedTimeMinutes } = response.data;
      
      if (!suggestedTimeMinutes || suggestedTimeMinutes <= 0) {
        throw new Error("Invalid time received from API");
      }
      
      // Set the timer with the suggested time
      const totalSeconds = suggestedTimeMinutes * 60;
      
      setTimerState({
        totalMinutes: suggestedTimeMinutes,
        secondsRemaining: totalSeconds,
        isActive: true,
        isLoading: false,
        error: null
      });
      
      toast.success(`Challenge timer set for ${suggestedTimeMinutes} minutes`);
    } catch (error) {
      console.error("Error fetching suggested time:", error);
      
      // Fallback to default time based on design level
      let defaultMinutes = 30;
      if (designLevel === "Senior") defaultMinutes = 40;
      if (designLevel === "Lead") defaultMinutes = 45;
      
      setTimerState({
        totalMinutes: defaultMinutes,
        secondsRemaining: defaultMinutes * 60,
        isActive: true,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to set timer"
      });
      
      toast.error(`Failed to get suggested time. Using ${defaultMinutes} minutes instead.`);
    }
  };

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
    timeRemaining: formatTimeRemaining(),
    timeRemainingPercentage: getTimeRemainingPercentage(),
    secondsRemaining: timerState.secondsRemaining,
    isActive: timerState.isActive,
    isLoading: timerState.isLoading,
    error: timerState.error,
    totalMinutes: timerState.totalMinutes,
    resetTimer: fetchSuggestedTime
  };
}
