
import { useEffect } from "react";
import { toast } from "sonner";

interface UseInitialMessageProps {
  initialMessage?: string;
  isVoiceMode: boolean;
  speakText: (text: string) => Promise<boolean>;
  initialMessageProcessedRef: React.MutableRefObject<boolean>;
}

/**
 * Hook to handle speaking the initial message
 */
export const useInitialMessage = ({
  initialMessage,
  isVoiceMode,
  speakText,
  initialMessageProcessedRef
}: UseInitialMessageProps) => {
  // Speak initial message if provided
  useEffect(() => {
    if (isVoiceMode && initialMessage && !initialMessageProcessedRef.current) {
      console.log("Voice assistant: Processing initial message for the first time");
      initialMessageProcessedRef.current = true;
      
      // Mark that user has interacted with the page
      document.documentElement.setAttribute('data-user-interacted', 'true');
      
      setTimeout(() => {
        console.log("Voice assistant: Speaking initial message");
        speakText(initialMessage).catch(err => {
          console.error("Error speaking initial message:", err);
          toast.error("Failed to read challenge description. Please try again.");
        });
      }, 1000);
    }
  }, [isVoiceMode, initialMessage, speakText, initialMessageProcessedRef]);
  
  return {
    resetInitialMessageSpoken: () => {
      initialMessageProcessedRef.current = false;
    }
  };
};
