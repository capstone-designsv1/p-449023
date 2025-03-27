
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChallengeDetails } from "@/context/ChallengeContext";

interface UseChallengeGeneratorProps {
  designLevel: "Junior" | "Senior" | "Lead";
  industry: string;
  forceRefresh?: boolean;
}

export const useChallengeGenerator = ({ 
  designLevel, 
  industry, 
  forceRefresh = false 
}: UseChallengeGeneratorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChallenge = async (): Promise<ChallengeDetails | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we have a cached challenge in localStorage
      const cacheKey = `challenge_${designLevel}_${industry}_${Date.now()}`;
      const cachedChallenge = localStorage.getItem(cacheKey);
      
      // Use cached challenge if available and not forcing refresh
      if (cachedChallenge && !forceRefresh) {
        const parsedChallenge = JSON.parse(cachedChallenge);
        // Only use cache if it's less than 1 hour old
        const cacheTime = new Date(parsedChallenge.cachedAt);
        const now = new Date();
        const cacheAgeMs = now.getTime() - cacheTime.getTime();
        const cacheAgeHours = cacheAgeMs / (1000 * 60 * 60);
        
        if (cacheAgeHours < 1) {
          console.log("Using cached challenge");
          return parsedChallenge.challenge;
        }
      }

      // Generate a new challenge
      console.log(`Generating new challenge for ${designLevel} in ${industry}`);
      const response = await supabase.functions.invoke('generate-challenge', {
        body: {
          designLevel,
          industry,
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const generatedChallenge: ChallengeDetails = response.data;
      
      // Cache the challenge
      localStorage.setItem(cacheKey, JSON.stringify({
        challenge: generatedChallenge,
        cachedAt: new Date().toISOString()
      }));

      return generatedChallenge;
    } catch (err) {
      console.error("Error generating challenge:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate challenge";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    generateChallenge
  };
};
