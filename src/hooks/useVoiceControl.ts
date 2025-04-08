import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useSpeechToText } from "./useSpeechToText";
import { useTextToSpeech } from "./useTextToSpeech";
import { ChatMessage } from "@/services/interviewChatService";

interface UseVoiceControlProps {
  chatHistory: ChatMessage[];
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
  } = useTextToSpeech({
    onSpeechStart: () => {},
    onSpeechEnd: () => {}
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
