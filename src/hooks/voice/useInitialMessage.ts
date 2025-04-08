
import { useRef, useEffect } from "react";
import { toast } from "sonner";

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
      console.log("Voice mode: Speaking initial message via useInitialMessage hook");
      initialMessageSpokenRef.current = true;
      
      // Mark that user has interacted with the page
      document.documentElement.setAttribute('data-user-interacted', 'true');
      
      setTimeout(() => {
        speakText(initialMessage).catch(err => {
          console.error("Error speaking initial message:", err);
          toast.error("Failed to read challenge description. Please try again.");
        });
      }, 1000);
    }
  }, [initialMessage, isVoiceMode, speakText]);
  
  // Reset the spoken flag when voice mode changes
  useEffect(() => {
    if (!isVoiceMode) {
      initialMessageSpokenRef.current = false;
    }
  }, [isVoiceMode]);
  
  return {
    initialMessageSpokenRef,
    resetInitialMessageSpoken: () => {
      initialMessageSpokenRef.current = false;
    }
  };
};
