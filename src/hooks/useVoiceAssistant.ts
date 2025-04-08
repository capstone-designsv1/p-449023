
import { useCallback, useEffect, useRef } from 'react';
import { useSpeechToText } from "./useSpeechToText";
import { useTextToSpeech } from "./useTextToSpeech";
import { useVoiceState } from './voice/useVoiceState';
import { toast } from 'sonner';

interface UseVoiceAssistantProps {
  onTranscriptReady: (text: string) => void;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  autoSpeakNewMessages?: boolean;
  initialMessage?: string;
}

export const useVoiceAssistant = ({
  onTranscriptReady,
  onSpeechStart,
  onSpeechEnd,
  autoSpeakNewMessages = true,
  initialMessage
}: UseVoiceAssistantProps) => {
  // Use our voice state management hook
  const {
    lastTranscript,
    handleTranscriptReady,
    handleSpeechStart,
    handleSpeechEnd
  } = useVoiceState({
    onTranscriptReady,
    onSpeechStart,
    onSpeechEnd
  });

  // Track if initial message has been spoken
  const initialMessageSpokenRef = useRef(false);

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

  // Speak initial message if provided
  useEffect(() => {
    if (initialMessage && !initialMessageSpokenRef.current) {
      initialMessageSpokenRef.current = true;
      setTimeout(() => {
        speakText(initialMessage).catch(err => {
          console.error("Error speaking initial message:", err);
          toast.error("Failed to read challenge description. Click the mic to start voice mode.");
        });
      }, 1000);
    }
  }, [initialMessage, speakText]);

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
