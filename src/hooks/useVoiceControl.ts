import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useSpeechToText } from "./useSpeechToText";
import { useTextToSpeech, ElevenLabsVoice } from "./useTextToSpeech";
import { ChatMessage } from "@/services/interview";

interface UseVoiceControlProps {
  chatHistory: ChatMessage[];
  sendMessage: (message: string) => void;
}

export const useVoiceControl = ({ chatHistory, sendMessage }: UseVoiceControlProps) => {
  const [inputText, setInputText] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  // Handle transcribed speech text
  const handleTranscriptReady = (text: string) => {
    console.log("Transcript ready:", text);
    setInputText(text);
    // Auto-send the transcribed message
    if (text.trim()) {
      sendMessage(text);
    }
  };
  
  // Initialize speech-to-text
  const {
    isListening,
    startListening,
    stopListening
  } = useSpeechToText({
    onTranscriptReady: handleTranscriptReady
  });

  // Initialize text-to-speech
  const {
    isSpeaking,
    currentVoice,
    speakText,
    stopSpeaking,
    changeVoice
  } = useTextToSpeech({
    onSpeechStart: () => {},
    onSpeechEnd: () => {}
  });

  // Toggle voice mode on/off
  const toggleVoiceMode = () => {
    if (!isVoiceMode) {
      // Ask for microphone permission before enabling
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setIsVoiceMode(true);
          toast.success("Voice mode enabled");
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

  // Toggle speaking state - play the last assistant message
  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (chatHistory.length > 0) {
      // Find the last assistant message
      const lastAssistantMessage = [...chatHistory]
        .reverse()
        .find(msg => msg.role === "assistant");
        
      if (lastAssistantMessage) {
        speakText(lastAssistantMessage.content);
      }
    }
  };

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
