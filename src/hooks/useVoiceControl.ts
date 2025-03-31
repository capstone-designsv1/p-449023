
import { useState } from "react";
import { useVoiceMode } from "@/hooks/useVoiceMode";
import { ElevenLabsVoice } from "@/hooks/useTextToSpeech";

interface UseVoiceControlProps {
  chatHistory: any[];
  sendMessage: (message: string) => void;
}

export const useVoiceControl = ({ chatHistory, sendMessage }: UseVoiceControlProps) => {
  const [inputText, setInputText] = useState("");
  
  // Handle transcribed speech text
  const handleTranscriptReady = (text: string) => {
    console.log("Transcript ready:", text);
    setInputText(text);
    // Auto-send the transcribed message
    if (text.trim()) {
      sendMessage(text);
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
    toggleSpeaking,
    changeVoice
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
    changeVoice
  };
};
