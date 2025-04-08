
import React from "react";
import { useChallengeContext } from "@/context/ChallengeContext";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import SubmitEvaluationButton from "./SubmitEvaluationButton";
import { useChatLogic } from "@/hooks/useChatLogic";
import VoiceControls from "./VoiceControls";
import { useVoiceControl } from "@/hooks/useVoiceControl";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSubmitForEvaluation: (data: { chatHistory?: ChatMessage[] }) => void;
  isEvaluating: boolean;
  isVoiceMode?: boolean;
  toggleVoiceMode?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSubmitForEvaluation,
  isEvaluating,
  isVoiceMode,
  toggleVoiceMode
}) => {
  const { chatHistory, setChatHistory, activeChallenge } = useChallengeContext();
  const { isSending, sendMessage } = useChatLogic(activeChallenge, chatHistory, setChatHistory);
  
  const {
    isVoiceMode: voiceControlMode,
    isListening,
    isSpeaking,
    inputText,
    setInputText,
    toggleVoiceMode: toggleVoiceControlMode,
    toggleListening,
    toggleSpeaking
  } = useVoiceControl({
    chatHistory,
    // We were incorrectly passing sendMessage here, but it's not in UseVoiceControlProps
    // Removing the sendMessage prop
    initialMessage: activeChallenge?.description,
    onMessageReady: (text) => {
      if (text.trim()) {
        sendMessage(text);
      }
    }
  });

  // Use external voice mode state if provided, otherwise use internal state
  const effectiveVoiceMode = isVoiceMode !== undefined ? isVoiceMode : voiceControlMode;
  const effectiveToggleVoiceMode = toggleVoiceMode || toggleVoiceControlMode;

  return (
    <div className="flex-1 flex flex-col mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Interview Partner</h2>
      </div>
      
      {/* Chat Messages */}
      <ChatMessageList messages={chatHistory} />
      
      {/* Voice Controls (when voice mode is enabled) */}
      {effectiveVoiceMode && (
        <VoiceControls
          isListening={isListening}
          isSpeaking={isSpeaking}
          isSending={isSending}
          toggleListening={toggleListening}
          toggleSpeaking={toggleSpeaking}
          hasChatHistory={chatHistory.length > 0}
        />
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
