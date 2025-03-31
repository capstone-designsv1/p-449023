
import { useState, useRef, useEffect } from "react";
import { useVoiceMode } from "./useVoiceMode";
import { ElevenLabsVoice } from "./useTextToSpeech";
import { 
  ChatMessage, 
  initializeChat, 
  sendMessageToAI, 
  endSession 
} from "@/services/interviewChatService";
import { toast } from "sonner";

interface UseInterviewChatProps {
  companyName: string;
  designLevel: "Junior" | "Senior" | "Lead";
  onSessionEnd: (feedback: string) => void;
}

export const useInterviewChat = ({
  companyName,
  designLevel,
  onSessionEnd,
}: UseInterviewChatProps) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_RETRIES = 2;

  // Voice mode functionality
  const handleSendVoiceMessage = (text: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsSending(true);
    
    sendMessageToAI(text, [...chatHistory, userMessage], companyName, designLevel)
      .then(aiMessage => {
        setChatHistory(prev => [...prev, aiMessage]);
      })
      .catch(error => {
        console.error("Error sending message:", error);
        handleRetryOrFallback();
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  const {
    isVoiceMode,
    isListening,
    isSpeaking,
    currentVoice,
    toggleVoiceMode,
    toggleListening,
    toggleSpeaking,
    changeVoice
  } = useVoiceMode({
    chatHistory,
    onMessageReady: handleSendVoiceMessage
  });

  // Initialize chat with first AI message
  useEffect(() => {
    initializeChatSession();
  }, [companyName, designLevel]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChatSession = async () => {
    setIsInitializing(true);
    try {
      const aiMessage = await initializeChat(companyName, designLevel);
      setChatHistory([aiMessage]);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: newMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsSending(true);
    setRetryCount(0);

    try {
      const aiMessage = await sendMessageToAI(newMessage, [...chatHistory, userMessage], companyName, designLevel);
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      handleRetryOrFallback();
    } finally {
      setIsSending(false);
    }
  };

  const handleRetryOrFallback = async () => {
    if (retryCount < MAX_RETRIES) {
      toast.info(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      setRetryCount(prev => prev + 1);
      try {
        const aiMessage = await sendMessageToAI(newMessage, chatHistory, companyName, designLevel);
        setChatHistory(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error("Retry failed:", error);
        if (retryCount + 1 >= MAX_RETRIES) {
          addFallbackResponse();
        } else {
          handleRetryOrFallback();
        }
      }
    } else {
      addFallbackResponse();
    }
  };

  const addFallbackResponse = () => {
    toast.error("Failed to get a response. Using a fallback response.");
    
    const fallbackResponse: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: "I'm having trouble processing your response right now. That's an interesting perspective though. Could you elaborate more on your design approach and how you would validate your solution with users?",
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, fallbackResponse]);
  };

  const handleEndSession = async () => {
    setIsSending(true);
    try {
      const feedback = await endSession(chatHistory, companyName, designLevel);
      onSessionEnd(feedback);
    } finally {
      setIsSending(false);
    }
  };

  return {
    chatHistory,
    isInitializing,
    messagesEndRef,
    newMessage,
    setNewMessage,
    isSending,
    isVoiceMode,
    isListening,
    isSpeaking,
    currentVoice,
    handleSendMessage,
    handleEndSession,
    toggleVoiceMode,
    toggleListening,
    toggleSpeaking,
    changeVoice
  };
};
