
import { useState, useCallback, useRef, useEffect } from "react";
import { useAutoSpeakConfig } from "./voice/useAutoSpeakConfig";
import { useMessageTracking } from "./voice/useMessageTracking";
import { useInitialMessage } from "./voice/useInitialMessage";
import { useSpeechToText } from "./useSpeechToText";
import { useTextToSpeech } from "./useTextToSpeech";
import { useVoiceInitialization } from "./voice/useVoiceInitialization";
import { useVoiceInteractions } from "./voice/useVoiceInteractions";
import { ChatMessage } from "@/services/interviewChatService";

interface UseVoiceControlProps {
  chatHistory: ChatMessage[];
  onMessageReady?: (text: string) => void;
  initialMessage?: string;
}

export const useVoiceControl = ({ 
  chatHistory, 
  onMessageReady,
  initialMessage
}: UseVoiceControlProps) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Use our auto-speak configuration hook
  const { autoSpeakEnabledRef, isAutoSpeakEnabled, toggleAutoSpeak } = useAutoSpeakConfig();
  
  // Create a ref for speech end handler to avoid stale closures
  const latestIsVoiceModeRef = useRef(isVoiceMode);
  const latestIsListeningRef = useRef(false);
  
  // Update refs when values change
  useEffect(() => {
    latestIsVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);
  
  // Handlers for speech-to-text and text-to-speech events
  const handleTranscriptReady = useCallback((text: string) => {
    console.log("Voice control: Transcript ready", text);
    setInputText(text);
    if (text.trim() && onMessageReady) {
      onMessageReady(text);
    }
  }, [onMessageReady]);
  
  const handleSpeechStart = useCallback(() => {
    console.log("Voice control: AI speaking started");
  }, []);
  
  // Initialize speech-to-text with handlers
  const { 
    isListening, 
    startListening, 
    stopListening 
  } = useSpeechToText({
    onTranscriptReady: handleTranscriptReady,
    maxRecordingTime: 30000, // 30 seconds max
    silenceDetectionTime: 10000 // 10 seconds of silence
  });
  
  // Update listening ref when value changes
  useEffect(() => {
    latestIsListeningRef.current = isListening;
  }, [isListening]);
  
  // Define speech end handler with proper access to latest state
  const handleSpeechEnd = useCallback(() => {
    console.log("Voice control: AI speaking ended");
    
    // Auto-start listening again after AI finishes speaking
    if (latestIsVoiceModeRef.current && autoSpeakEnabledRef.current) {
      console.log("Voice control: Auto-starting listening after AI finished speaking");
      setTimeout(() => {
        if (!latestIsListeningRef.current) {
          console.log("Voice control: Starting listening after speech");
          startListening();
        }
      }, 800);
    }
  }, [startListening, autoSpeakEnabledRef]);

  // Initialize text-to-speech with handlers
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

  // Use our initial message hook to handle speaking the first message
  const { initialMessageSpokenRef, resetInitialMessageSpoken } = useInitialMessage({
    initialMessage,
    isVoiceMode,
    speakText
  });
  
  // Use our message tracking hook to auto-speak assistant messages
  useMessageTracking({
    chatHistory,
    isVoiceMode,
    speakText,
    isListening,
    stopListening,
    isAutoSpeakEnabled: autoSpeakEnabledRef.current,
    isSpeaking
  });

  // Use our voice initialization hook
  const { toggleVoiceMode: handleVoiceToggle } = useVoiceInitialization({
    initialMessage,
    startListening,
    stopListening,
    stopSpeaking,
    autoSpeakEnabledRef,
    resetInitialMessageSpoken
  });

  // Use our voice interactions hook
  const { toggleListening: handleToggleListening, toggleSpeaking: handleToggleSpeaking } = useVoiceInteractions({
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    stopSpeaking,
    speakText,
    chatHistory
  });

  // Wrapper for toggleVoiceMode that updates state
  const toggleVoiceMode = useCallback(() => {
    const result = handleVoiceToggle(!isVoiceMode, isListening, isSpeaking);
    if (result !== undefined) {
      setIsVoiceMode(!!result);
    } else {
      setIsVoiceMode(!isVoiceMode);
    }
  }, [isVoiceMode, isListening, isSpeaking, handleVoiceToggle]);

  // Update handler references when dependencies change
  const toggleListening = useCallback(() => {
    handleToggleListening();
  }, [handleToggleListening]);

  const toggleSpeaking = useCallback(() => {
    handleToggleSpeaking();
  }, [handleToggleSpeaking]);

  return {
    isVoiceMode,
    isListening,
    isSpeaking,
    currentVoice,
    inputText,
    setInputText,
    toggleVoiceMode,
    toggleListening,
    toggleSpeaking,
    toggleAutoSpeak,
    isAutoSpeakEnabled: autoSpeakEnabledRef.current,
    changeVoice
  };
};
