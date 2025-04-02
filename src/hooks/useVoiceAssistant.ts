
import { useState, useCallback } from 'react';
import { useSpeechToText } from "./useSpeechToText";
import { useTextToSpeech } from "./useTextToSpeech";
import { toast } from "sonner";

interface UseVoiceAssistantProps {
  onTranscriptReady: (text: string) => void;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
}

export const useVoiceAssistant = ({
  onTranscriptReady,
  onSpeechStart,
  onSpeechEnd
}: UseVoiceAssistantProps) => {
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

  // Use our specialized hooks for speech-to-text and text-to-speech
  const { 
    isListening, 
    startListening, 
    stopListening 
  } = useSpeechToText({
    onTranscriptReady: handleTranscriptReady
  });

  const {
    isSpeaking,
    speakText,
    stopSpeaking
  } = useTextToSpeech({
    onSpeechStart: handleSpeechStart,
    onSpeechEnd: handleSpeechEnd
  });

  return {
    isListening,
    isSpeaking,
    lastTranscript,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  };
};
