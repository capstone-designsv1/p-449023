
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
    console.log("Voice mode: Transcript ready", text);
    if (text.trim()) {
      onMessageReady(text);
    }
  };
  
  const handleSpeechStart = () => {
    console.log("Voice mode: AI speaking started");
    toast.info("AI is speaking...");
  };
  
  const handleSpeechEnd = () => {
    console.log("Voice mode: AI speaking ended");
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
      // Only auto-speak new assistant messages
      if (lastMessage.role === 'assistant' && lastMessage.content !== lastAssistantMessageRef.current) {
        console.log("Voice mode: New assistant message detected, auto-speaking");
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
          toast.success("Voice mode enabled");
          console.log("Voice mode enabled");
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
      toast.success("Voice mode disabled");
      console.log("Voice mode disabled");
    }
  };

  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      console.log("Voice mode: Stopping listening");
      stopListening();
    } else {
      console.log("Voice mode: Starting listening");
      startListening();
    }
  };

  // Toggle speaking state
  const toggleSpeaking = () => {
    if (isSpeaking) {
      console.log("Voice mode: Stopping speaking");
      stopSpeaking();
    } else if (chatHistory.length > 0) {
      // Find the last assistant message
      const lastAssistantMessage = [...chatHistory].reverse().find(msg => msg.role === 'assistant');
      if (lastAssistantMessage) {
        console.log("Voice mode: Speaking last assistant message");
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
