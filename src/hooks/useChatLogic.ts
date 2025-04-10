
import { useState, useEffect } from "react";
import { ChallengeDetails } from "@/context/ChallengeContext";
import { ChatMessage } from "@/types/chat";
import { initializeChatSession } from "@/utils/chatInitializationUtils";
import { sendMessageWithRetries } from "@/services/chatMessageService";

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
    await initializeChatSession(activeChallenge, setChatHistory, setIsSending);
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
      await sendMessageWithRetries(
        userMessage, 
        chatHistory, 
        activeChallenge, 
        setChatHistory
      );
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    sendMessage
  };
};
