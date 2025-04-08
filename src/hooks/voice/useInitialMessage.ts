
import { useRef, useEffect } from "react";

interface UseInitialMessageProps {
  initialMessage?: string;
  isVoiceMode: boolean;
  speakText: (text: string) => Promise<boolean>;
}

/**
 * Hook to handle speaking the initial message
 */
export const useInitialMessage = ({
  initialMessage,
  isVoiceMode,
  speakText
}: UseInitialMessageProps) => {
  const initialMessageSpokenRef = useRef(false);
  
  // Speak initial message if provided
  useEffect(() => {
    if (initialMessage && !initialMessageSpokenRef.current && isVoiceMode) {
      initialMessageSpokenRef.current = true;
      console.log("Voice mode: Speaking initial message");
      
      // Mark that user has interacted with the page
      document.documentElement.setAttribute('data-user-interacted', 'true');
      
      setTimeout(() => {
        speakText(initialMessage).catch(err => {
          console.error("Error speaking initial message:", err);
        });
      }, 1000);
    }
  }, [initialMessage, isVoiceMode, speakText]);
  
  return {
    initialMessageSpokenRef
  };
};
