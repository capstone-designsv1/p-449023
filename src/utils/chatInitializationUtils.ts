import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChallengeDetails } from "@/context/ChallengeContext";
import { ChatMessage } from "@/types/chat";

/**
 * Initializes a chat session with the AI interviewer
 */
export const initializeChatSession = async (
  activeChallenge: ChallengeDetails | null,
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {
  if (!activeChallenge) return;
  
  setIsSending(true);
  
  try {
    const companyName = activeChallenge.company;
    const industry = getChallengeIndustry(activeChallenge);
    
    console.log("Initializing chat with company:", companyName, "industry:", industry);
    
    const response = await supabase.functions.invoke('interview-chat', {
      body: {
        action: "start",
        companyName: companyName,
        designLevel: "Senior", // This should ideally be configurable
        industry: industry,
        chunkResponses: true // Add a flag to request chunked responses
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: response.data.message,
      timestamp: new Date()
    };

    setChatHistory([aiMessage]);
  } catch (error) {
    console.error("Error initializing chat:", error);
    toast.error("Failed to start the interview. Using a default message.");
    
    // Add a fallback first message if API fails
    if (activeChallenge) {
      const fallbackMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: `Hello! I'm a design interviewer from ${activeChallenge.company}. I'd like to discuss the challenge: ${activeChallenge.title}. Please share your thoughts on how you would approach this design problem.`,
        timestamp: new Date()
      };
      
      setChatHistory([fallbackMessage]);
    }
  } finally {
    setIsSending(false);
  }
};

/**
 * Extract or infer industry from challenge details
 */
export const getChallengeIndustry = (challenge: ChallengeDetails): string => {
  // If the challenge has an explicit industry field, use it
  if (challenge.industry) {
    return challenge.industry;
  }
  
  // Otherwise, try to infer from the ID or company name
  const id = challenge.id.toLowerCase();
  if (id.includes('ecommerce') || id.includes('e-commerce')) {
    return 'E-commerce';
  } else if (id.includes('fintech') || id.includes('finance')) {
    return 'Fintech';
  } else if (id.includes('health')) {
    return 'Healthcare';
  } else if (id.includes('social') || id.includes('media')) {
    return 'Social Media';
  } else if (id.includes('travel')) {
    return 'Travel';
  } else if (id.includes('edu')) {
    return 'Education';
  }
  
  // Default fallback
  return 'Technology';
};
