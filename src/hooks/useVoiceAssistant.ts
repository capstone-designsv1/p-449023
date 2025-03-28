
import { useState, useRef, useCallback } from 'react';
import { useSpeechToText } from "./useSpeechToText";
import { useTextToSpeech } from "./useTextToSpeech";

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
  // Use our specialized hooks for speech-to-text and text-to-speech
  const { 
    isListening, 
    startListening, 
    stopListening 
  } = useSpeechToText({
    onTranscriptReady
  });

  const {
    isSpeaking,
    speakText,
    stopSpeaking
  } = useTextToSpeech({
    onSpeechStart,
    onSpeechEnd
  });

  return {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  };
};
