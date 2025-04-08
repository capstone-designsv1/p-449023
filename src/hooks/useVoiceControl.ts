
import { useState } from "react";
import { useVoiceMode } from "@/hooks/useVoiceMode";

interface UseVoiceControlProps {
  chatHistory: any[];
  sendMessage: (message: string) => void;
  onMessageReady?: (text: string) => void; // Add this optional property
}

export const useVoiceControl = ({ chatHistory, sendMessage, onMessageReady }: UseVoiceControlProps) => {
  const [inputText, setInputText] = useState("");
  
  // Handle transcribed speech text
  const handleTranscriptReady = (text: string) => {
    console.log("Transcript ready:", text);
    setInputText(text);
    // Auto-send the transcribed message
    if (text.trim()) {
      sendMessage(text);
    }
    // Forward the transcript to the optional callback if provided
    if (onMessageReady) {
      onMessageReady(text);
    }
  };
  
  // Initialize voice mode with handlers
  const {
    isVoiceMode,
    isListening,
    isSpeaking,
    currentVoice,
    toggleVoiceMode,
    toggleListening,
    toggleSpeaking
  } = useVoiceMode({
    chatHistory,
    onMessageReady: handleTranscriptReady
  });

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
    // Keep changeVoice in the returned object for backward compatibility
    changeVoice: () => {} // No-op since we're using a fixed voice
  };
};
