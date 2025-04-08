
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useSpeechToText } from "../useSpeechToText";
import { useTextToSpeech } from "../useTextToSpeech";
import { ChatMessage } from "@/services/interviewChatService";
import { useInitialMessage } from "./useInitialMessage";
import { useMessageTracking } from "./useMessageTracking";

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
  
  // Create ref for auto-speak functionality with a longer silence detection
  const autoSpeakEnabledRef = useRef(true);
  const initialMessageProcessedRef = useRef(false);
  
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
    if (isVoiceMode && autoSpeakEnabledRef.current) {
      console.log("Voice assistant: Auto-starting listening after speech");
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
    onTranscriptReady: handleTranscriptReady,
    maxRecordingTime: 15000, // 15 seconds max
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

  // Handle initial message speaking - only used when voice mode is first enabled
  useEffect(() => {
    if (isVoiceMode && initialMessage && !initialMessageProcessedRef.current) {
      console.log("Voice assistant: Processing initial message for the first time");
      initialMessageProcessedRef.current = true;
      
      // Mark that user has interacted with the page
      document.documentElement.setAttribute('data-user-interacted', 'true');
      
      setTimeout(() => {
        console.log("Voice assistant: Speaking initial message");
        speakText(initialMessage).catch(err => {
          console.error("Error speaking initial message:", err);
        });
      }, 1000);
    }
  }, [isVoiceMode, initialMessage, speakText]);

  // Use our message tracking hook to auto-speak new assistant messages
  useEffect(() => {
    // Only process if in voice mode and auto-speak is enabled
    if (!isVoiceMode || !autoSpeakEnabledRef.current) return;
    
    // This is for new messages (not the initial one)
    if (chatHistory.length > 0 && initialMessageProcessedRef.current) {
      // Get the last assistant message
      const lastAssistantMessage = [...chatHistory].reverse().find(msg => msg.role === 'assistant');
      
      if (lastAssistantMessage && !isSpeaking) {
        console.log("Voice assistant: New assistant message detected, speaking it now");
        
        // If we're listening, stop listening while the AI speaks
        if (isListening) {
          console.log("Voice assistant: Stopping listening for AI to speak");
          stopListening();
        }
        
        // Mark that user has interacted with the page
        document.documentElement.setAttribute('data-user-interacted', 'true');
        
        // Short delay to ensure UI is ready
        setTimeout(() => {
          speakText(lastAssistantMessage.content).catch(error => {
            console.error("Failed to speak new message:", error);
          });
        }, 300);
      }
    }
  }, [chatHistory, isVoiceMode, speakText, isListening, stopListening, isSpeaking]);

  // Enable or disable voice mode
  const enableVoiceMode = useCallback(() => {
    // Ask for microphone permission before enabling
    console.log("Voice assistant: Requesting microphone permission");
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log("Voice assistant: Microphone permission granted");
        setIsVoiceMode(true);
        toast.success("Voice mode enabled");
        
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
    if (isListening) {
      console.log("Voice assistant: Stopping listening on disable");
      stopListening();
    }
    if (isSpeaking) {
      console.log("Voice assistant: Stopping speaking on disable");
      stopSpeaking();
    }
    setIsVoiceMode(false);
    toast.success("Voice mode disabled");
    console.log("Voice assistant: Voice mode disabled");
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
      console.log("Voice assistant: Stopping listening by user");
      stopListening();
    } else {
      console.log("Voice assistant: Starting listening by user");
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Toggle speaking state
  const toggleSpeaking = useCallback(() => {
    if (isSpeaking) {
      console.log("Voice assistant: Stopping speaking by user");
      stopSpeaking();
    } else if (chatHistory.length > 0) {
      // Find the last assistant message
      const lastAssistantMessage = [...chatHistory].reverse().find(msg => msg.role === 'assistant');
      if (lastAssistantMessage) {
        console.log("Voice assistant: Speaking last assistant message by user");
        
        // Mark that user has interacted with the page
        document.documentElement.setAttribute('data-user-interacted', 'true');
        
        speakText(lastAssistantMessage.content);
      }
    }
  }, [isSpeaking, stopSpeaking, speakText, chatHistory]);

  // Toggle auto-speak feature
  const toggleAutoSpeak = useCallback(() => {
    autoSpeakEnabledRef.current = !autoSpeakEnabledRef.current;
    toast.info(`Auto-speak ${autoSpeakEnabledRef.current ? 'enabled' : 'disabled'}`);
    console.log(`Voice assistant: Auto-speak ${autoSpeakEnabledRef.current ? 'enabled' : 'disabled'}`);
  }, []);

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
    speakText,
    toggleAutoSpeak
  };
};
