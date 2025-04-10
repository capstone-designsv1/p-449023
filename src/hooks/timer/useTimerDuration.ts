
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useTimerDuration() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchSuggestedTime = async (
    title: string,
    description: string,
    designLevel: string,
    industry: string
  ) => {
    setIsLoading(true);
    setError(null);
    
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
      
      const totalSeconds = suggestedTimeMinutes * 60;
      
      toast.success(`Challenge timer set for ${suggestedTimeMinutes} minutes`);
      
      setIsLoading(false);
      
      return {
        totalMinutes: suggestedTimeMinutes,
        secondsRemaining: totalSeconds
      };
    } catch (error) {
      console.error("Error fetching suggested time:", error);
      
      // Fallback to default time based on design level
      let defaultMinutes = 30;
      if (designLevel === "Senior") defaultMinutes = 40;
      if (designLevel === "Lead") defaultMinutes = 45;
      
      setError(error instanceof Error ? error.message : "Failed to set timer");
      setIsLoading(false);
      
      toast.error(`Failed to get suggested time. Using ${defaultMinutes} minutes instead.`);
      
      return {
        totalMinutes: defaultMinutes,
        secondsRemaining: defaultMinutes * 60
      };
    }
  };

  return {
    fetchSuggestedTime,
    isLoading,
    error
  };
}
