
import { useRef, useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook to manage auto-speak settings
 */
export const useAutoSpeakConfig = () => {
  const autoSpeakEnabledRef = useRef(true);
  
  // Toggle auto-speak feature
  const toggleAutoSpeak = useCallback(() => {
    autoSpeakEnabledRef.current = !autoSpeakEnabledRef.current;
    toast.info(`Auto-speak ${autoSpeakEnabledRef.current ? 'enabled' : 'disabled'}`);
  }, []);
  
  return {
    autoSpeakEnabledRef,
    isAutoSpeakEnabled: autoSpeakEnabledRef.current,
    toggleAutoSpeak
  };
};
