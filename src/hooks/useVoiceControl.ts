
import { useState, useCallback } from "react";
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

  // Use our message tracking hook to auto-speak assistant messages
  useMessageTracking({
    chatHistory,
    isVoiceMode,
    speakText,
    isListening,
    stopListening,
    isAutoSpeakEnabled: autoSpeakEnabledRef.current
  });
  
  // Use our initial message hook to handle speaking the first message
  useInitialMessage({
    initialMessage,
    isVoiceMode,
    speakText
  });

  // Toggle voice mode on/off
  const toggleVoiceMode = useCallback(() => {
    if (!isVoiceMode) {
      // Ask for microphone permission before enabling
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setIsVoiceMode(true);
          console.log("Voice mode enabled");
          
          // Mark that user has interacted with the page
          document.documentElement.setAttribute('data-user-interacted', 'true');
          
          // Speak initial message if available and not yet spoken
          if (initialMessage) {
            setTimeout(() => {
              speakText(initialMessage).catch(err => {
                console.error("Error speaking initial message after enabling voice mode:", err);
              });
            }, 500);
          }
          // If there's no initial message, start listening
          else if (autoSpeakEnabledRef.current) {
            setTimeout(() => {
              startListening();
            }, 500);
          }
        })
        .catch((err) => {
          console.error("Microphone permission denied:", err);
        });
    } else {
      // Disable voice mode
      if (isListening) stopListening();
      if (isSpeaking) stopSpeaking();
      setIsVoiceMode(false);
      console.log("Voice mode disabled");
    }
  }, [isVoiceMode, initialMessage, isListening, isSpeaking, stopListening, stopSpeaking, startListening, speakText]);

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
