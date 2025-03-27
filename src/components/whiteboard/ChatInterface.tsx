
import React, { useState, useRef, useEffect } from "react";
import { useChallengeContext } from "@/context/ChallengeContext";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import SubmitEvaluationButton from "./SubmitEvaluationButton";
import { useChatLogic } from "@/hooks/useChatLogic";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSubmitForEvaluation: (data: { chatHistory?: ChatMessage[] }) => void;
  isEvaluating: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSubmitForEvaluation,
  isEvaluating
}) => {
  const { chatHistory, setChatHistory, activeChallenge } = useChallengeContext();
  const { isSending, sendMessage } = useChatLogic(activeChallenge, chatHistory, setChatHistory);
  const [inputText, setInputText] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const lastAssistantMessageRef = useRef<string | null>(null);
  
  const handleTranscriptReady = (text: string) => {
    setInputText(text);
    // Auto-send the transcribed message
    if (text.trim()) {
      sendMessage(text);
    }
  };
  
  const handleSpeechStart = () => {
    // Visual indicator that AI is speaking
    toast.info("AI Assistant is speaking...", { duration: 2000 });
  };
  
  const handleSpeechEnd = () => {
    // Speech ended
  };
  
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

  // Track the last assistant message and speak it if in voice mode
  useEffect(() => {
    if (isVoiceMode && chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content !== lastAssistantMessageRef.current) {
        lastAssistantMessageRef.current = lastMessage.content;
        speakText(lastMessage.content);
      }
    }
  }, [chatHistory, isVoiceMode, speakText]);

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

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

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

  return (
    <div className="flex-1 flex flex-col mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Interview Partner</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            className={`${isVoiceMode ? 'bg-green-100' : ''}`}
            onClick={toggleVoiceMode}
            title={isVoiceMode ? "Disable voice mode" : "Enable voice mode"}
          >
            {isVoiceMode 
              ? <Volume2 className="h-4 w-4 text-green-700" /> 
              : <VolumeX className="h-4 w-4" />
            }
          </Button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <ChatMessageList messages={chatHistory} />
      
      {/* Voice Controls (when voice mode is enabled) */}
      {isVoiceMode && (
        <div className="flex justify-center space-x-3 my-2">
          <Button
            variant="outline"
            size="sm"
            className={`${isListening ? 'bg-red-100 text-red-700 border-red-300' : ''}`}
            onClick={toggleListening}
            disabled={isSending}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-1" /> Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-1" /> Start Listening
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSpeaking}
            disabled={chatHistory.length === 0}
            className={isSpeaking ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-4 w-4 mr-1" /> Stop Speaking
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-1" /> Speak Last Message
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Message Input */}
      <ChatInput 
        onSendMessage={sendMessage} 
        isSending={isSending}
        inputText={inputText}
        setInputText={setInputText}
      />
      
      {/* Submit for Evaluation Button */}
      <SubmitEvaluationButton 
        chatHistory={chatHistory}
        onSubmit={onSubmitForEvaluation}
        isEvaluating={isEvaluating}
      />
    </div>
  );
};

export default ChatInterface;
