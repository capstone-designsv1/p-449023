
import { useRef, useEffect } from "react";
import { ChatMessage } from "@/services/interviewChatService";

interface UseMessageTrackingProps {
  chatHistory: ChatMessage[];
  isVoiceMode: boolean;
  speakText: (text: string) => Promise<boolean>;
  isListening: boolean;
  stopListening: () => void;
  isAutoSpeakEnabled: boolean;
}

/**
 * Hook to track and handle new messages in the chat
 */
export const useMessageTracking = ({
  chatHistory,
  isVoiceMode,
  speakText,
  isListening,
  stopListening,
  isAutoSpeakEnabled
}: UseMessageTrackingProps) => {
  const lastAssistantMessageRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const previousChatLengthRef = useRef(0);
  
  // Auto-speak AI responses when in voice mode
  useEffect(() => {
    if (isVoiceMode && chatHistory.length > 0 && isInitializedRef.current && isAutoSpeakEnabled) {
      // Check if we have a new message
      if (chatHistory.length > previousChatLengthRef.current) {
        const lastMessage = chatHistory[chatHistory.length - 1];
        previousChatLengthRef.current = chatHistory.length;
        
        // Only auto-speak new assistant messages
        if (lastMessage.role === 'assistant' && lastMessage.content !== lastAssistantMessageRef.current) {
          console.log("Voice mode: New assistant message detected, auto-speaking");
          lastAssistantMessageRef.current = lastMessage.content;
          
          // Make sure we stop listening while AI is speaking
          if (isListening) {
            stopListening();
          }
          
          // Set a flag for user interaction if needed
          document.documentElement.setAttribute('data-user-interacted', 'true');
          
          // Short delay to ensure UI is ready
          setTimeout(() => {
            speakText(lastMessage.content)
              .catch(error => {
                console.error("Failed to auto-speak message:", error);
              });
          }, 300);
        }
      }
    }
  }, [chatHistory, isVoiceMode, speakText, isListening, stopListening, isAutoSpeakEnabled]);
  
  // Set initialized after first render
  useEffect(() => {
    isInitializedRef.current = true;
    previousChatLengthRef.current = chatHistory.length;
    
    // Add a click listener to document to handle user interaction requirement
    const handleUserInteraction = () => {
      document.documentElement.setAttribute('data-user-interacted', 'true');
    };
    
    document.addEventListener('click', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [chatHistory.length]);
  
  return {
    lastAssistantMessageRef
  };
};
