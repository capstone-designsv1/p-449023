
import { useCallback } from 'react';
import { useSpeechToText } from "./useSpeechToText";
import { useTextToSpeech } from "./useTextToSpeech";
import { useVoiceState } from './voice/useVoiceState';

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
