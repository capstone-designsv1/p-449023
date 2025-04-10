
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChallengeContext, ChallengeDetails } from "@/context/ChallengeContext";

export const useChallengeInitialization = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { setActiveChallenge, clearChatHistory } = useChallengeContext();

  const handleBackToList = () => {
    // Clear the timer when navigating back to the list
    if (challengeId) {
      localStorage.removeItem(`challenge_timer_${challengeId}`);
    }
    navigate("/challenges");
  };
  
  const initializeChallenge = async () => {
    if (!challengeId) {
      navigate("/challenges");
      return;
    }

    try {
      // Try to get the challenge from sessionStorage first
      const storedChallenge = sessionStorage.getItem('currentChallenge');
      
      if (storedChallenge) {
        try {
          const parsedChallenge = JSON.parse(storedChallenge) as ChallengeDetails;
          // Only use if IDs match
          if (parsedChallenge.id === challengeId) {
            setActiveChallenge(parsedChallenge);
            clearChatHistory();
            return;
          }
        } catch (error) {
          console.error("Error parsing stored challenge:", error);
        }
      }
      
      // If we don't have a stored challenge (or wrong ID), load it via the API
      // Use the ID from the URL as a seed for generating a challenge
      const [level, industry] = challengeId.split('-');
      const designLevel = level === 'junior' ? 'Junior' : level === 'lead' ? 'Lead' : 'Senior';
      
      // Generate a new challenge via the API
      const response = await supabase.functions.invoke('generate-challenge', {
        body: {
          designLevel,
          industry: industry.charAt(0).toUpperCase() + industry.slice(1), // Capitalize first letter
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Use the generated challenge
      const generatedChallenge = response.data;
      
      // Validate required fields are present in the response
      if (!generatedChallenge || !generatedChallenge.id || !generatedChallenge.title) {
        console.error("Invalid challenge data received:", generatedChallenge);
        throw new Error("Received invalid challenge data from the server");
      }
      
      // Save to session storage for future use
      sessionStorage.setItem('currentChallenge', JSON.stringify(generatedChallenge));
      
      setActiveChallenge(generatedChallenge);
      clearChatHistory();
      
    } catch (error) {
      console.error("Error initializing challenge:", error);
      toast.error("Failed to load challenge. Redirecting to challenges page.");
      navigate("/challenges");
    }
  };

  return {
    handleBackToList,
    initializeChallenge
  };
};
