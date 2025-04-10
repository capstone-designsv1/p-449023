
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChatMessage } from "@/types/chat";
import { ChallengeDetails } from "@/context/ChallengeContext";
import { getChallengeIndustry } from "@/utils/chatInitializationUtils";

/**
 * Sends a message to the AI interview service with retry capability
 */
export const sendMessageWithRetries = async (
  userMessage: ChatMessage,
  chatHistory: ChatMessage[],
  activeChallenge: ChallengeDetails | null,
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  currentRetry: number = 0,
  maxRetries: number = 2
): Promise<void> => {
  if (currentRetry >= maxRetries || !activeChallenge) {
    // Max retries reached, add fallback response
    const fallbackMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: "I'm having trouble with my connection. That's an interesting point though. Could you tell me more about your approach to this design challenge?",
      timestamp: new Date()
    };
    
    setChatHistory((prev) => [...prev, fallbackMessage]);
    return;
  }
  
  try {
    const companyName = activeChallenge.company;
    const industry = getChallengeIndustry(activeChallenge);
    
    console.log("Sending message with company:", companyName, "industry:", industry);
    console.log("Retry attempt:", currentRetry + 1, "of", maxRetries);
    
    const response = await supabase.functions.invoke('interview-chat', {
      body: {
        action: "chat",
        message: userMessage.content,
        history: chatHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
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

    setChatHistory((prev) => [...prev, aiMessage]);
  } catch (error) {
    console.error("Error sending message:", error);
    
    // If we still have retries left
    if (currentRetry < maxRetries - 1) {
      const delayMs = 1000 * Math.pow(2, currentRetry); // Exponential backoff
      console.log(`Retrying in ${delayMs}ms...`);
      toast.info(`Having trouble connecting. Retrying... (${currentRetry + 1}/${maxRetries})`);
      
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, delayMs));
      await sendMessageWithRetries(
        userMessage, 
        chatHistory, 
        activeChallenge, 
        setChatHistory, 
        currentRetry + 1,
        maxRetries
      );
    } else {
      toast.error("Failed to get a response after multiple attempts.");
      
      // Add fallback response on final retry failure
      const fallbackMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: "I apologize for the technical difficulties. Let's continue our discussion. Could you elaborate more on your approach to solving this design challenge?",
        timestamp: new Date()
      };
      
      setChatHistory((prev) => [...prev, fallbackMessage]);
    }
  }
};
