
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChallengeDetails } from "@/context/ChallengeContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const useChatLogic = (
  activeChallenge: ChallengeDetails | null,
  chatHistory: ChatMessage[],
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  const [isSending, setIsSending] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  // Initialize chat with the first AI message when component mounts
  useEffect(() => {
    if (chatHistory.length === 0 && activeChallenge) {
      initializeChat();
    }
  }, [activeChallenge, chatHistory.length]);

  const initializeChat = async () => {
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

  const sendMessage = async (newMessage: string) => {
    if (!newMessage.trim() || isSending || !activeChallenge) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: newMessage,
      timestamp: new Date()
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setIsSending(true);
    setRetryCount(0);

    try {
      await sendMessageWithRetries(userMessage, 0);
    } finally {
      setIsSending(false);
    }
  };
  
  const sendMessageWithRetries = async (userMessage: ChatMessage, currentRetry: number) => {
    if (currentRetry >= MAX_RETRIES || !activeChallenge) {
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
      console.log("Retry attempt:", currentRetry + 1, "of", MAX_RETRIES);
      
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
      if (currentRetry < MAX_RETRIES - 1) {
        const delayMs = 1000 * Math.pow(2, currentRetry); // Exponential backoff
        console.log(`Retrying in ${delayMs}ms...`);
        toast.info(`Having trouble connecting. Retrying... (${currentRetry + 1}/${MAX_RETRIES})`);
        
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, delayMs));
        await sendMessageWithRetries(userMessage, currentRetry + 1);
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

  // Helper function to extract industry from challenge details
  const getChallengeIndustry = (challenge: ChallengeDetails): string => {
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

  return {
    isSending,
    sendMessage
  };
};
