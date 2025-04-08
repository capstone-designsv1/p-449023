
import { useCallback } from "react";

interface UseVoiceInteractionsProps {
  isListening: boolean;
  isSpeaking: boolean;
  startListening: () => void;
  stopListening: () => void;
  stopSpeaking: () => void;
  speakText: (text: string) => Promise<boolean>;
  chatHistory: any[];
}

/**
 * Hook to handle voice interactions like toggling listening and speaking
 */
export const useVoiceInteractions = ({
  isListening,
  isSpeaking,
  startListening,
  stopListening,
  stopSpeaking,
  speakText,
  chatHistory
}: UseVoiceInteractionsProps) => {
  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening) {
      console.log("Voice interactions: Stopping listening");
      stopListening();
    } else {
      console.log("Voice interactions: Starting listening");
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Toggle speaking state
  const toggleSpeaking = useCallback(() => {
    if (isSpeaking) {
      console.log("Voice interactions: Stopping speaking");
      stopSpeaking();
    } else if (chatHistory.length > 0) {
      // Find the last assistant message
      const lastAssistantMessage = [...chatHistory].reverse().find(msg => msg.role === 'assistant');
      if (lastAssistantMessage) {
        console.log("Voice interactions: Speaking last assistant message");
        
        // Mark that user has interacted with the page
        document.documentElement.setAttribute('data-user-interacted', 'true');
        
        speakText(lastAssistantMessage.content);
      }
    }
  }, [isSpeaking, stopSpeaking, speakText, chatHistory]);

  return {
    toggleListening,
    toggleSpeaking
  };
};
