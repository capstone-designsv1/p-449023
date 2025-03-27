
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const useChatLogic = (
  activeChallenge: any,
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
      const industry = activeChallenge.industry || getIndustryFromCompany(companyName);
      
      console.log("Initializing chat with company:", companyName, "industry:", industry);
      
      const response = await supabase.functions.invoke('interview-chat', {
        body: {
          action: "start",
          companyName: companyName,
          designLevel: activeChallenge.designLevel || "Senior",
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
      const industry = activeChallenge.industry || getIndustryFromCompany(companyName);
      
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
          designLevel: activeChallenge.designLevel || "Senior",
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

  // Helper function to determine industry from company if not explicitly provided
  const getIndustryFromCompany = (companyName: string): string => {
    const companyIndustryMap: Record<string, string> = {
      'Uber': 'transportation and delivery',
      'Airbnb': 'hospitality and accommodation',
      'Meta': 'social media and technology',
      // Add more mappings as needed
    };
    
    return companyIndustryMap[companyName] || 'technology';
  };

  return {
    isSending,
    sendMessage
  };
};
