
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
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
 */
export const useVoiceAssistant = ({
  chatHistory,
  onMessageReady,
  initialMessage
}: UseVoiceAssistantProps) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Create ref for auto-speak functionality
  const autoSpeakEnabledRef = useRef(true);
  
  // Handlers for speech-to-text and text-to-speech events
  const handleTranscriptReady = (text: string) => {
    console.log("Voice assistant: Transcript ready", text);
    setInputText(text);
    if (text.trim() && onMessageReady) {
      onMessageReady(text);
    }
  };
  
  const handleSpeechStart = () => {
    console.log("Voice assistant: AI speaking started");
  };
  
  const handleSpeechEnd = () => {
    console.log("Voice assistant: AI speaking ended");
    
    // Auto-start listening again after AI finishes speaking
    if (isVoiceMode && !isListening && autoSpeakEnabledRef.current) {
      setTimeout(() => {
        startListening();
      }, 500);
    }
  };
  
  // Initialize voice assistant with handlers
  const { 
    isListening, 
    startListening, 
    stopListening 
  } = useSpeechToText({
    onTranscriptReady: handleTranscriptReady
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

  // Enable or disable voice mode
  const enableVoiceMode = useCallback(() => {
    // Ask for microphone permission before enabling
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setIsVoiceMode(true);
        toast.success("Voice mode enabled");
        console.log("Voice mode enabled");
        
        // Mark that user has interacted with the page
        document.documentElement.setAttribute('data-user-interacted', 'true');
      })
      .catch((err) => {
        console.error("Microphone permission denied:", err);
        toast.error("Microphone access is required for voice mode");
      });
  }, []);
  
  // Disable voice mode
  const disableVoiceMode = useCallback(() => {
    if (isListening) stopListening();
    if (isSpeaking) stopSpeaking();
    setIsVoiceMode(false);
    toast.success("Voice mode disabled");
    console.log("Voice mode disabled");
  }, [isListening, isSpeaking, stopListening, stopSpeaking]);
  
  // Toggle voice mode on/off
  const toggleVoiceMode = useCallback(() => {
    if (!isVoiceMode) {
      enableVoiceMode();
    } else {
      disableVoiceMode();
    }
  }, [isVoiceMode, enableVoiceMode, disableVoiceMode]);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening) {
      console.log("Voice assistant: Stopping listening");
      stopListening();
    } else {
      console.log("Voice assistant: Starting listening");
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Toggle speaking state
  const toggleSpeaking = useCallback(() => {
    if (isSpeaking) {
      console.log("Voice assistant: Stopping speaking");
      stopSpeaking();
    } else if (chatHistory.length > 0) {
      // Find the last assistant message
      const lastAssistantMessage = [...chatHistory].reverse().find(msg => msg.role === 'assistant');
      if (lastAssistantMessage) {
        console.log("Voice assistant: Speaking last assistant message");
        
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
    changeVoice,
    speakText
  };
};
