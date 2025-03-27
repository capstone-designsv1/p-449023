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

  // Initialize chat with the first AI message when component mounts
  useEffect(() => {
    if (chatHistory.length === 0 && activeChallenge) {
      initializeChat();
    }
  }, [activeChallenge, chatHistory.length]);

  const initializeChat = async () => {
    if (!activeChallenge) return;
    
    try {
      const companyName = activeChallenge.company;
      const industry = getChallengeIndustry(activeChallenge);
      
      console.log("Initializing chat with company:", companyName, "industry:", industry);
      
      const response = await supabase.functions.invoke('interview-chat', {
        body: {
          action: "start",
          companyName: companyName,
          designLevel: "Senior", // This should ideally be configurable
          industry: industry
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
      toast.error("Failed to start the interview. Please try again.");
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

    try {
      const companyName = activeChallenge.company;
      const industry = getChallengeIndustry(activeChallenge);
      
      console.log("Sending message with company:", companyName, "industry:", industry);
      
      const response = await supabase.functions.invoke('interview-chat', {
        body: {
          action: "chat",
          message: newMessage,
          history: chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          companyName: companyName,
          designLevel: "Senior", // This should ideally be configurable
          industry: industry
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
      toast.error("Failed to get a response. Please try again.");
    } finally {
      setIsSending(false);
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
