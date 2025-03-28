
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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const generateChallenge = async (): Promise<ChallengeDetails | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we have a cached challenge in localStorage
      const cacheKey = `challenge_${designLevel}_${industry}`;
      const cachedChallenge = localStorage.getItem(cacheKey);
      
      // Use cached challenge if available and not forcing refresh
      if (cachedChallenge && !forceRefresh) {
        try {
          const parsedCache = JSON.parse(cachedChallenge);
          // Only use cache if it's less than 1 hour old
          const cacheTime = new Date(parsedCache.cachedAt);
          const now = new Date();
          const cacheAgeMs = now.getTime() - cacheTime.getTime();
          const cacheAgeHours = cacheAgeMs / (1000 * 60 * 60);
          
          if (cacheAgeHours < 1 && parsedCache.challenge) {
            console.log("Using cached challenge");
            setIsLoading(false);
            return parsedCache.challenge;
          }
        } catch (e) {
          console.error("Error parsing cached challenge:", e);
          // Continue to generate a new challenge if cache parsing fails
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
        throw new Error(response.error.message || "Failed to generate challenge");
      }

      // Validate the response data
      if (!response.data || !response.data.id || !response.data.title) {
        console.error("Invalid challenge data received:", response.data);
        throw new Error("Received invalid challenge data from the server");
      }

      const generatedChallenge: ChallengeDetails = response.data;
      
      // Cache the challenge
      localStorage.setItem(cacheKey, JSON.stringify({
        challenge: generatedChallenge,
        cachedAt: new Date().toISOString()
      }));

      // Reset retry count on success
      setRetryCount(0);
      setIsLoading(false);
      return generatedChallenge;
    } catch (err) {
      console.error("Error generating challenge:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate challenge";
      
      // If we haven't exceeded max retries, automatically try again
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        toast.error(`Error generating challenge. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        return generateChallenge();
      }
      
      setError(errorMessage);
      toast.error(`Failed to generate challenge after ${MAX_RETRIES} attempts. Please try again later.`);
      setIsLoading(false);
      return null;
    }
  };

  return {
    isLoading,
    error,
    generateChallenge,
    retryCount
  };
};
