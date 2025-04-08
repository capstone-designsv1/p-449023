
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAutoSpeakConfig } from "./voice/useAutoSpeakConfig";
import { useMessageTracking } from "./voice/useMessageTracking";
import { useInitialMessage } from "./voice/useInitialMessage";
import { useSpeechToText } from "./useSpeechToText";
import { useTextToSpeech } from "./useTextToSpeech";
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
  const firstInitializationRef = useRef(true);
  
  // Use our auto-speak configuration hook
  const { autoSpeakEnabledRef, isAutoSpeakEnabled, toggleAutoSpeak } = useAutoSpeakConfig();
  
  // Handlers for speech-to-text and text-to-speech events
  const handleTranscriptReady = (text: string) => {
    console.log("Voice mode: Transcript ready", text);
    setInputText(text);
    if (text.trim() && onMessageReady) {
      onMessageReady(text);
    }
  };
  
  const handleSpeechStart = () => {
    console.log("Voice mode: AI speaking started");
  };
  
  const handleSpeechEnd = () => {
    console.log("Voice mode: AI speaking ended");
    
    // Auto-start listening again after AI finishes speaking
    if (isVoiceMode && autoSpeakEnabledRef.current) {
      console.log("Voice mode: Auto-starting listening after AI finished speaking");
      setTimeout(() => {
        if (!isListening) {
          console.log("Voice mode: Starting listening after speech");
          startListening();
        }
      }, 800);
    }
  };
  
  // Initialize voice assistant with handlers
  const { 
    isListening, 
    startListening, 
    stopListening 
  } = useSpeechToText({
    onTranscriptReady: handleTranscriptReady,
    maxRecordingTime: 30000, // 30 seconds max
    silenceDetectionTime: 10000 // 10 seconds of silence
  });

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

  // Use our initial message hook to handle speaking the first message, with reset capability
  const { initialMessageSpokenRef, resetInitialMessageSpoken } = useInitialMessage({
    initialMessage,
    isVoiceMode,
    speakText
  });
  
  // Use our message tracking hook to auto-speak assistant messages
  // Only track and speak new messages, not initial ones
  useMessageTracking({
    chatHistory,
    isVoiceMode,
    speakText,
    isListening,
    stopListening,
    isAutoSpeakEnabled: autoSpeakEnabledRef.current,
    isSpeaking
  });

  // Toggle voice mode on/off
  const toggleVoiceMode = useCallback(() => {
    if (!isVoiceMode) {
      // Ask for microphone permission before enabling
      console.log("Voice mode: Requesting microphone permission");
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log("Voice mode: Microphone permission granted");
          setIsVoiceMode(true);
          toast.success("Voice mode enabled");
          
          // Mark that user has interacted with the page
          document.documentElement.setAttribute('data-user-interacted', 'true');
          
          // Only auto-start listening on first voice mode activation if there's no initial message
          if (!initialMessage && firstInitializationRef.current && autoSpeakEnabledRef.current) {
            firstInitializationRef.current = false;
            setTimeout(() => {
              console.log("Voice mode: Auto-starting listening (no initial message)");
              startListening();
            }, 800);
          }
        })
        .catch((err) => {
          console.error("Voice mode: Microphone permission denied:", err);
          toast.error("Microphone access is required for voice mode");
        });
    } else {
      // Disable voice mode
      if (isListening) {
        console.log("Voice mode: Stopping listening before disabling voice mode");
        stopListening();
      }
      if (isSpeaking) {
        console.log("Voice mode: Stopping speaking before disabling voice mode");
        stopSpeaking();
      }
      setIsVoiceMode(false);
      resetInitialMessageSpoken();
      firstInitializationRef.current = true;
      toast.success("Voice mode disabled");
      console.log("Voice mode: Voice mode disabled");
    }
  }, [isVoiceMode, initialMessage, isListening, isSpeaking, stopListening, stopSpeaking, startListening, autoSpeakEnabledRef, resetInitialMessageSpoken]);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening) {
      console.log("Voice mode: Stopping listening");
      stopListening();
    } else {
      console.log("Voice mode: Starting listening");
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Toggle speaking state
  const toggleSpeaking = useCallback(() => {
    if (isSpeaking) {
      console.log("Voice mode: Stopping speaking");
      stopSpeaking();
    } else if (chatHistory.length > 0) {
      // Find the last assistant message
      const lastAssistantMessage = [...chatHistory].reverse().find(msg => msg.role === 'assistant');
      if (lastAssistantMessage) {
        console.log("Voice mode: Speaking last assistant message");
        
        // Mark that user has interacted with the page
        document.documentElement.setAttribute('data-user-interacted', 'true');
        
        speakText(lastAssistantMessage.content);
      }
    }
  }, [isSpeaking, stopSpeaking, speakText, chatHistory]);

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
