
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSpeechToText } from "./useSpeechToText";
import { useTextToSpeech } from "./useTextToSpeech";
import { ChatMessage } from "@/services/interviewChatService";

interface UseVoiceControlProps {
  chatHistory: ChatMessage[];
  onMessageReady?: (text: string) => void; // Add this property to fix the error
  initialMessage?: string;
}

export const useVoiceControl = ({ 
  chatHistory, 
  onMessageReady,
  initialMessage
}: UseVoiceControlProps) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const lastAssistantMessageRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const autoSpeakEnabledRef = useRef(true);
  const previousChatLengthRef = useRef(0);
  const initialMessageSpokenRef = useRef(false);
  
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

  // Speak initial message if provided
  useEffect(() => {
    if (initialMessage && !initialMessageSpokenRef.current && isVoiceMode) {
      initialMessageSpokenRef.current = true;
      console.log("Voice mode: Speaking initial message");
      
      // Mark that user has interacted with the page
      document.documentElement.setAttribute('data-user-interacted', 'true');
      
      setTimeout(() => {
        speakText(initialMessage).catch(err => {
          console.error("Error speaking initial message:", err);
          toast.error("Failed to read the initial message. Please try again.");
        });
      }, 1000);
    }
  }, [initialMessage, isVoiceMode, speakText]);

  // Auto-speak AI responses when in voice mode
  useEffect(() => {
    if (isVoiceMode && chatHistory.length > 0 && isInitializedRef.current && autoSpeakEnabledRef.current) {
      // Check if we have a new message
      if (chatHistory.length > previousChatLengthRef.current) {
        const lastMessage = chatHistory[chatHistory.length - 1];
        previousChatLengthRef.current = chatHistory.length;
        
        // Only auto-speak new assistant messages
        if (lastMessage.role === 'assistant' && lastMessage.content !== lastAssistantMessageRef.current) {
          console.log("Voice mode: New assistant message detected, auto-speaking");
          lastAssistantMessageRef.current = lastMessage.content;
          
          // Make sure we stop listening while AI is speaking
          if (isListening) {
            stopListening();
          }
          
          // Set a flag for user interaction if needed
          document.documentElement.setAttribute('data-user-interacted', 'true');
          
          // Short delay to ensure UI is ready
          setTimeout(() => {
            speakText(lastMessage.content)
              .catch(error => {
                console.error("Failed to auto-speak message:", error);
                toast.error("Couldn't play audio automatically. Please try again.");
              });
          }, 300);
        }
      }
    }
  }, [chatHistory, isVoiceMode, speakText, isListening, stopListening]);
  
  // Set initialized after first render
  useEffect(() => {
    isInitializedRef.current = true;
    previousChatLengthRef.current = chatHistory.length;
    
    // Add a click listener to document to handle user interaction requirement
    const handleUserInteraction = () => {
      document.documentElement.setAttribute('data-user-interacted', 'true');
    };
    
    document.addEventListener('click', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [chatHistory.length]);

  // Toggle voice mode on/off
  const toggleVoiceMode = useCallback(() => {
    if (!isVoiceMode) {
      // Ask for microphone permission before enabling
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setIsVoiceMode(true);
          toast.success("Voice mode enabled");
          console.log("Voice mode enabled");
          
          // Mark that user has interacted with the page
          document.documentElement.setAttribute('data-user-interacted', 'true');
          
          // Speak initial message if available and not yet spoken
          if (initialMessage && !initialMessageSpokenRef.current) {
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

  // Toggle auto-speak feature
  const toggleAutoSpeak = useCallback(() => {
    autoSpeakEnabledRef.current = !autoSpeakEnabledRef.current;
    toast.info(`Auto-speak ${autoSpeakEnabledRef.current ? 'enabled' : 'disabled'}`);
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
    toggleAutoSpeak,
    isAutoSpeakEnabled: autoSpeakEnabledRef.current,
    changeVoice
  };
};
