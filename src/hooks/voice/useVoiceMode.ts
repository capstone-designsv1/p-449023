
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface UseVoiceModeProps {
  isListening: boolean;
  isSpeaking: boolean;
  stopListening: () => void;
  stopSpeaking: () => void;
}

/**
 * Hook to manage voice mode state and initialization
 */
export const useVoiceMode = ({
  isListening,
  isSpeaking,
  stopListening,
  stopSpeaking
}: UseVoiceModeProps) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const initialMessageProcessedRef = useRef(false);
  
  // Enable voice mode with microphone permission check
  const enableVoiceMode = useCallback(() => {
    // Ask for microphone permission before enabling
    console.log("Voice assistant: Requesting microphone permission");
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log("Voice assistant: Microphone permission granted");
        setIsVoiceMode(true);
        toast.success("Voice mode enabled");
        
        // Mark that user has interacted with the page
        document.documentElement.setAttribute('data-user-interacted', 'true');
      })
      .catch((err) => {
        console.error("Microphone permission denied:", err);
        toast.error("Microphone access is required for voice mode");
      });
  }, []);
  
  // Disable voice mode and cleanup
  const disableVoiceMode = useCallback(() => {
    if (isListening) {
      console.log("Voice assistant: Stopping listening on disable");
      stopListening();
    }
    if (isSpeaking) {
      console.log("Voice assistant: Stopping speaking on disable");
      stopSpeaking();
    }
    setIsVoiceMode(false);
    toast.success("Voice mode disabled");
    initialMessageProcessedRef.current = false;
    console.log("Voice assistant: Voice mode disabled");
  }, [isListening, isSpeaking, stopListening, stopSpeaking]);
  
  // Toggle voice mode on/off
  const toggleVoiceMode = useCallback(() => {
    if (!isVoiceMode) {
      enableVoiceMode();
    } else {
      disableVoiceMode();
    }
  }, [isVoiceMode, enableVoiceMode, disableVoiceMode]);

  return {
    isVoiceMode,
    toggleVoiceMode,
    initialMessageProcessedRef
  };
};
