
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface UseInitialMessageProps {
  initialMessage?: string;
  isVoiceMode: boolean;
  speakText: (text: string) => Promise<boolean>;
  initialMessageProcessedRef?: React.MutableRefObject<boolean>;
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
  // Create a local ref if none was provided
  const localInitialMessageProcessedRef = useRef(false);
  const effectiveRef = initialMessageProcessedRef || localInitialMessageProcessedRef;
  
  // Speak initial message if provided
  useEffect(() => {
    if (isVoiceMode && initialMessage && !effectiveRef.current) {
      console.log("Voice assistant: Processing initial message for the first time");
      effectiveRef.current = true;
      
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
  }, [isVoiceMode, initialMessage, speakText, effectiveRef]);
  
  return {
    resetInitialMessageSpoken: () => {
      effectiveRef.current = false;
    }
  };
};
