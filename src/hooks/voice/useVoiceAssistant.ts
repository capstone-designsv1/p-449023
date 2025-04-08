
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useVoiceMode } from "./useVoiceMode";
import { useVoiceInteractions } from "./useVoiceInteractions";
import { useAutoSpeakConfig } from "./useAutoSpeakConfig";
import { useInitialMessage } from "./useInitialMessage";
import { useMessageTracking } from "./useMessageTracking";
import { useSpeechToText } from "../useSpeechToText";
import { useTextToSpeech } from "../useTextToSpeech";
import { ChatMessage } from "@/services/interviewChatService";

interface UseVoiceAssistantProps {
  chatHistory: ChatMessage[];
  onMessageReady?: (text: string) => void;
  initialMessage?: string;
}

/**
 * Core hook for voice assistant functionality that combines speech-to-text and text-to-speech
 * This hook coordinates all the voice functionality hooks
 */
export const useVoiceAssistant = ({
  chatHistory,
  onMessageReady,
  initialMessage
}: UseVoiceAssistantProps) => {
  const [inputText, setInputText] = useState('');
  
  // Auto-speak configuration
  const { autoSpeakEnabledRef, toggleAutoSpeak } = useAutoSpeakConfig();
  
  // Setup handlers for speech-to-text and text-to-speech events
  const handleTranscriptReady = useCallback((text: string) => {
    console.log("Voice assistant: Transcript ready", text);
    setInputText(text);
    if (text.trim() && onMessageReady) {
      onMessageReady(text);
    }
  }, [onMessageReady]);
  
  const handleSpeechStart = useCallback(() => {
    console.log("Voice assistant: AI speaking started");
  }, []);
  
  const handleSpeechEnd = useCallback(() => {
    console.log("Voice assistant: AI speaking ended");
  }, []);
  
  // Initialize speech-to-text
  const { 
    isListening, 
    startListening, 
    stopListening 
  } = useSpeechToText({
    onTranscriptReady: handleTranscriptReady,
    maxRecordingTime: 15000, // 15 seconds max
    silenceDetectionTime: 10000 // 10 seconds of silence
  });

  // Initialize text-to-speech
  const {
    isSpeaking,
    currentVoice,
    changeVoice,
    speakText,
    stopSpeaking
  } = useTextToSpeech({
    onSpeechStart: handleSpeechStart,
    onSpeechEnd: handleSpeechEnd
  });

  // Voice mode management (enable/disable)
  const {
    isVoiceMode,
    toggleVoiceMode,
    initialMessageProcessedRef
  } = useVoiceMode({
    isListening,
    isSpeaking,
    stopListening,
    stopSpeaking
  });

  // Process initial message
  useInitialMessage({
    initialMessage,
    isVoiceMode,
    speakText,
    initialMessageProcessedRef
  });

  // Track and auto-speak new messages
  useMessageTracking({
    chatHistory,
    isVoiceMode,
    speakText,
    isListening,
    stopListening,
    isAutoSpeakEnabled: autoSpeakEnabledRef.current,
    isSpeaking
  });

  // Voice interaction controls
  const { toggleListening: handleToggleListening, toggleSpeaking: handleToggleSpeaking } = useVoiceInteractions({
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    stopSpeaking,
    speakText,
    chatHistory
  });

  return {
    isVoiceMode,
    isListening,
    isSpeaking,
    currentVoice,
    inputText,
    setInputText,
    toggleVoiceMode,
    toggleListening: handleToggleListening,
    toggleSpeaking: handleToggleSpeaking,
    changeVoice,
    speakText,
    toggleAutoSpeak
  };
};
