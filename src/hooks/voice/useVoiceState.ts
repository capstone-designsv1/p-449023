
import { useState, useCallback } from 'react';

interface UseVoiceStateProps {
  onTranscriptReady: (text: string) => void;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
}

/**
 * Hook for managing voice assistant state
 */
export const useVoiceState = ({
  onTranscriptReady,
  onSpeechStart,
  onSpeechEnd
}: UseVoiceStateProps) => {
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  
  // Handle transcript finalization
  const handleTranscriptReady = useCallback((text: string) => {
    console.log("Voice assistant: Transcript received", text);
    setLastTranscript(text);
    onTranscriptReady(text);
  }, [onTranscriptReady]);

  // Handle speech start
  const handleSpeechStart = useCallback(() => {
    console.log("Voice assistant: Speech started");
    onSpeechStart();
  }, [onSpeechStart]);

  // Handle speech end
  const handleSpeechEnd = useCallback(() => {
    console.log("Voice assistant: Speech ended");
    onSpeechEnd();
  }, [onSpeechEnd]);

  return {
    lastTranscript,
    handleTranscriptReady,
    handleSpeechStart,
    handleSpeechEnd
  };
};
