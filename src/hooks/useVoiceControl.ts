
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

interface UseVoiceControlProps {
  chatHistory: any[];
  sendMessage: (message: string) => void;
}

export const useVoiceControl = ({ chatHistory, sendMessage }: UseVoiceControlProps) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [inputText, setInputText] = useState("");
  const lastAssistantMessageRef = useRef<string | null>(null);
  
  // Handle transcribed speech text
  const handleTranscriptReady = (text: string) => {
    console.log("Transcript ready:", text);
    setInputText(text);
    // Auto-send the transcribed message
    if (text.trim()) {
      sendMessage(text);
    }
  };
  
  // Visual indicator that AI is speaking
  const handleSpeechStart = () => {
    console.log("AI speaking started");
    toast.info("AI Assistant is speaking...", { duration: 2000 });
  };
  
  // Handle speech end event
  const handleSpeechEnd = () => {
    console.log("AI speaking ended");
  };
  
  // Initialize voice assistant with handlers
  const { 
    isListening, 
    isSpeaking,
    startListening, 
    stopListening, 
    speakText, 
    stopSpeaking 
  } = useVoiceAssistant({
    onTranscriptReady: handleTranscriptReady,
    onSpeechStart: handleSpeechStart,
    onSpeechEnd: handleSpeechEnd
  });

  // Auto-speak AI responses when in voice mode
  useEffect(() => {
    if (isVoiceMode && chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content !== lastAssistantMessageRef.current) {
        console.log("Auto-speaking new assistant message");
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
    inputText,
    setInputText,
    toggleVoiceMode,
    toggleListening,
    toggleSpeaking
  };
};
