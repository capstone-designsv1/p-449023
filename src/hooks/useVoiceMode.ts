
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useSpeechToText } from "./useSpeechToText";
import { useTextToSpeech } from "./useTextToSpeech";
import { ChatMessage } from "@/services/interviewChatService";

interface UseVoiceModeProps {
  chatHistory: ChatMessage[];
  onMessageReady: (text: string) => void;
}

export const useVoiceMode = ({ chatHistory, onMessageReady }: UseVoiceModeProps) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const lastAssistantMessageRef = useRef<string | null>(null);
  
  // Handlers for speech-to-text and text-to-speech events
  const handleTranscriptReady = (text: string) => {
    if (text.trim()) {
      onMessageReady(text);
    }
  };
  
  const handleSpeechStart = () => {
    toast.info("AI is speaking...", { duration: 2000 });
  };
  
  const handleSpeechEnd = () => {
    // Optional callback when speech ends
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
    speakText,
    stopSpeaking
  } = useTextToSpeech({
    onSpeechStart: handleSpeechStart,
    onSpeechEnd: handleSpeechEnd
  });

  // Auto-speak AI responses when in voice mode
  useEffect(() => {
    if (isVoiceMode && chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content !== lastAssistantMessageRef.current) {
        lastAssistantMessageRef.current = lastMessage.content;
        speakText(lastMessage.content);
      }
    }
  }, [chatHistory, isVoiceMode, speakText]);

  // Toggle voice mode on/off
  const toggleVoiceMode = () => {
    if (!isVoiceMode) {
      // Ask for microphone permission before enabling
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setIsVoiceMode(true);
          toast.success("Voice mode enabled", { duration: 2000 });
        })
        .catch((err) => {
          console.error("Microphone permission denied:", err);
          toast.error("Microphone access is required for voice mode");
        });
    } else {
      // Disable voice mode
      if (isListening) stopListening();
      if (isSpeaking) stopSpeaking();
      setIsVoiceMode(false);
      toast.success("Voice mode disabled", { duration: 2000 });
    }
  };

  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Toggle speaking state
  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (chatHistory.length > 0) {
      // Find the last assistant message
      const lastAssistantMessage = [...chatHistory].reverse().find(msg => msg.role === 'assistant');
      if (lastAssistantMessage) {
        speakText(lastAssistantMessage.content);
      }
    }
  };

  return {
    isVoiceMode,
    isListening,
    isSpeaking,
    toggleVoiceMode,
    toggleListening,
    toggleSpeaking
  };
};
