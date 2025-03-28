
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChallengeContext, ChallengeDetails } from "@/context/ChallengeContext";

export const useChallengeInitialization = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { setActiveChallenge, clearChatHistory } = useChallengeContext();

  const handleBackToList = () => {
    navigate("/challenges");
  };
  
  const initializeChallenge = () => {
    if (challengeId) {
      // Try to get the challenge from sessionStorage first
      const storedChallenge = sessionStorage.getItem('currentChallenge');
      
      if (storedChallenge) {
        try {
          const parsedChallenge = JSON.parse(storedChallenge) as ChallengeDetails;
          // Only use if IDs match
          if (parsedChallenge.id === challengeId) {
            setActiveChallenge(parsedChallenge);
            clearChatHistory();
            toast.success(`Challenge loaded: ${parsedChallenge.title}`);
            return;
          }
        } catch (error) {
          console.error("Error parsing stored challenge:", error);
        }
      }
      
      // If we don't have a stored challenge (or wrong ID), load it via the API
      try {
        // Use the ID from the URL as a seed for generating a challenge
        const [level, industry] = challengeId.split('-');
        const designLevel = level === 'junior' ? 'Junior' : level === 'lead' ? 'Lead' : 'Senior';
        
        // Generate a new challenge via the API
        supabase.functions.invoke('generate-challenge', {
          body: {
            designLevel,
            industry: industry.charAt(0).toUpperCase() + industry.slice(1), // Capitalize first letter
          }
        }).then(response => {
          if (response.error) {
            throw new Error(response.error.message);
          }
          
          // Use the generated challenge
          const generatedChallenge = response.data;
          setActiveChallenge(generatedChallenge);
          clearChatHistory();
          toast.success(`Challenge loaded: ${generatedChallenge.title}`);
        }).catch(error => {
          console.error("Error generating challenge:", error);
          toast.error("Failed to load challenge. Redirecting to challenges page.");
          navigate("/challenges");
        });
      } catch (error) {
        console.error("Error initializing challenge:", error);
        navigate("/challenges");
      }
    } else {
      navigate("/challenges");
    }
  };

  return {
    handleBackToList,
    initializeChallenge
  };
};
