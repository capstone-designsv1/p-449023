
import { useCallback, useRef } from "react";
import { toast } from "sonner";

interface UseVoiceInitializationProps {
  initialMessage?: string;
  startListening: () => void;
  stopListening: () => void;
  stopSpeaking: () => void;
  autoSpeakEnabledRef: React.MutableRefObject<boolean>;
  resetInitialMessageSpoken: () => void;
}

/**
 * Hook to handle voice mode initialization and toggling
 */
export const useVoiceInitialization = ({
  initialMessage,
  startListening,
  stopListening,
  stopSpeaking,
  autoSpeakEnabledRef,
  resetInitialMessageSpoken
}: UseVoiceInitializationProps) => {
  const firstInitializationRef = useRef(true);

  // Toggle voice mode on/off
  const toggleVoiceMode = useCallback((isVoiceMode: boolean, isListening: boolean, isSpeaking: boolean) => {
    if (!isVoiceMode) {
      // Ask for microphone permission before enabling
      console.log("Voice initialization: Requesting microphone permission");
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log("Voice initialization: Microphone permission granted");
          toast.success("Voice mode enabled");
          
          // Mark that user has interacted with the page
          document.documentElement.setAttribute('data-user-interacted', 'true');
          
          // Only auto-start listening on first voice mode activation if there's no initial message
          if (!initialMessage && firstInitializationRef.current && autoSpeakEnabledRef.current) {
            firstInitializationRef.current = false;
            setTimeout(() => {
              console.log("Voice initialization: Auto-starting listening (no initial message)");
              startListening();
            }, 800);
          }
          
          return true; // Return true to indicate successful voice mode enabling
        })
        .catch((err) => {
          console.error("Voice initialization: Microphone permission denied:", err);
          toast.error("Microphone access is required for voice mode");
          return false; // Return false to indicate failed voice mode enabling
        });
    } else {
      // Disable voice mode
      if (isListening) {
        console.log("Voice initialization: Stopping listening before disabling voice mode");
        stopListening();
      }
      if (isSpeaking) {
        console.log("Voice initialization: Stopping speaking before disabling voice mode");
        stopSpeaking();
      }
      resetInitialMessageSpoken();
      firstInitializationRef.current = true;
      toast.success("Voice mode disabled");
      console.log("Voice initialization: Voice mode disabled");
      return false; // Return false to indicate voice mode was disabled
    }
  }, [initialMessage, startListening, stopListening, stopSpeaking, autoSpeakEnabledRef, resetInitialMessageSpoken]);

  return {
    toggleVoiceMode,
    firstInitializationRef
  };
};
