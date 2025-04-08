
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/services/interviewChatService";

interface UseMessageTrackingProps {
  chatHistory: ChatMessage[];
  isVoiceMode: boolean;
  speakText: (text: string) => Promise<boolean>;
  isListening: boolean;
  stopListening: () => void;
  isAutoSpeakEnabled: boolean;
  isSpeaking?: boolean;
}

/**
 * Hook to track and automatically speak new assistant messages
 */
export const useMessageTracking = ({
  chatHistory,
  isVoiceMode,
  speakText,
  isListening,
  stopListening,
  isAutoSpeakEnabled,
  isSpeaking = false
}: UseMessageTrackingProps) => {
  const lastAssistantMessageIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const lastSpeakTimeRef = useRef(0);
  
  useEffect(() => {
    // Skip initial render to avoid speaking on component mount
    if (!isInitializedRef.current) {
      console.log("MessageTracking: Initializing message tracking");
      isInitializedRef.current = true;
      
      // Store initial last message ID if there are messages
      if (chatHistory.length > 0) {
        const assistantMessages = chatHistory.filter(msg => msg.role === 'assistant');
        if (assistantMessages.length > 0) {
          const lastMsg = assistantMessages[assistantMessages.length - 1];
          lastAssistantMessageIdRef.current = lastMsg.id;
          console.log(`MessageTracking: Initial last assistant message ID: ${lastMsg.id}`);
        }
      }
      return;
    }
    
    // Only proceed if in voice mode and auto-speak is enabled
    if (!isVoiceMode || !isAutoSpeakEnabled) {
      return;
    }
    
    // Find the last assistant message and speak it if it's new
    const assistantMessages = chatHistory.filter(msg => msg.role === 'assistant');
    
    if (assistantMessages.length > 0) {
      const lastMsg = assistantMessages[assistantMessages.length - 1];
      
      // Check if this is a new message (different ID)
      if (lastMsg.id !== lastAssistantMessageIdRef.current) {
        console.log(`MessageTracking: New message detected - ID: ${lastMsg.id} (previous: ${lastAssistantMessageIdRef.current})`);
        lastAssistantMessageIdRef.current = lastMsg.id;
        
        // Prevent duplicate speaking by checking time since last speak
        const now = Date.now();
        if (now - lastSpeakTimeRef.current > 2000 && !isSpeaking) {
          console.log("MessageTracking: Speaking new assistant message");
          lastSpeakTimeRef.current = now;
          
          // If we're listening, stop listening while the AI speaks
          if (isListening) {
            console.log("MessageTracking: Stopping listening for AI to speak");
            stopListening();
          }
          
          // Mark that user has interacted with the page
          document.documentElement.setAttribute('data-user-interacted', 'true');
          
          // Short delay to ensure UI is ready
          setTimeout(() => {
            speakText(lastMsg.content).catch(error => {
              console.error("MessageTracking: Failed to speak new message:", error);
            });
          }, 500);
        } else if (isSpeaking) {
          console.log("MessageTracking: Already speaking, not starting new speech");
        } else {
          console.log(`MessageTracking: Skipping duplicate speech (last speak: ${now - lastSpeakTimeRef.current}ms ago)`);
        }
      }
    }
  }, [chatHistory, isVoiceMode, speakText, isListening, stopListening, isAutoSpeakEnabled, isSpeaking]);
  
  return {
    lastAssistantMessageIdRef
  };
};
